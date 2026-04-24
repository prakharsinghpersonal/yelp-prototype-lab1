from __future__ import annotations

import json
import os
import time
import uuid

from pymongo.database import Database

from db.database import utcnow
from services.event_handlers import process_event

INLINE_KAFKA_CONSUMER = os.getenv("KAFKA_INLINE_CONSUMER", "true").lower() == "true"
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "")

_producer = None


def _get_producer():
    global _producer
    if _producer is not None or not KAFKA_BOOTSTRAP_SERVERS:
        return _producer
    try:
        from kafka import KafkaProducer

        _producer = KafkaProducer(
            bootstrap_servers=[server.strip() for server in KAFKA_BOOTSTRAP_SERVERS.split(",") if server.strip()],
            value_serializer=lambda value: json.dumps(value, default=str).encode("utf-8"),
        )
    except Exception:
        _producer = None
    return _producer


def publish_event(db: Database, topic: str, payload: dict) -> dict:
    event_id = payload.get("event_id") or str(uuid.uuid4())
    payload = {**payload, "event_id": event_id}
    created_at = utcnow()

    db.events.update_one(
        {"event_id": event_id},
        {
            "$setOnInsert": {
                "event_id": event_id,
                "topic": topic,
                "payload": payload,
                "created_at": created_at,
                "status": "queued",
            }
        },
        upsert=True,
    )

    producer = _get_producer()
    if producer is not None:
        try:
            producer.send(topic, payload)
            producer.flush(timeout=2)
        except Exception as exc:
            db.events.update_one(
                {"event_id": event_id},
                {"$set": {"publish_error": str(exc), "updated_at": utcnow()}},
            )

    if INLINE_KAFKA_CONSUMER or producer is None:
        result = process_event(db, topic, payload)
        db.events.update_one(
            {"event_id": event_id},
            {
                "$set": {
                    "status": "processed",
                    "result": result,
                    "processed_at": utcnow(),
                }
            },
        )
        return result

    for _ in range(20):
        event = db.events.find_one({"event_id": event_id})
        if event and event.get("status") == "processed" and event.get("result") is not None:
            return event["result"]
        time.sleep(0.25)

    return {"event_id": event_id, "status": "queued"}
