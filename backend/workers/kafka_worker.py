import json
import os
import time

from kafka import KafkaConsumer

from db.database import ensure_indexes, get_database, utcnow
from services.event_handlers import process_event


def main() -> None:
    bootstrap = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    topics = [topic.strip() for topic in os.getenv("KAFKA_TOPICS", "review.created,review.updated,review.deleted,restaurant.created,restaurant.updated,restaurant.claimed").split(",") if topic.strip()]
    group_id = os.getenv("KAFKA_GROUP_ID", "yelp-lab2-workers")
    db = get_database()
    ensure_indexes(db)

    while True:
        try:
            consumer = KafkaConsumer(
                *topics,
                bootstrap_servers=[server.strip() for server in bootstrap.split(",") if server.strip()],
                group_id=group_id,
                value_deserializer=lambda value: json.loads(value.decode("utf-8")),
                auto_offset_reset="earliest",
                enable_auto_commit=True,
            )
            for message in consumer:
                payload = message.value
                event_id = payload.get("event_id")
                existing = db.events.find_one({"event_id": event_id, "status": "processed"})
                if existing:
                    continue
                result = process_event(db, message.topic, payload)
                db.events.update_one(
                    {"event_id": event_id},
                    {
                        "$set": {
                            "event_id": event_id,
                            "topic": message.topic,
                            "payload": payload,
                            "status": "processed",
                            "result": result,
                            "processed_at": utcnow(),
                        }
                    },
                    upsert=True,
                )
        except Exception as exc:
            print(f"kafka worker error: {exc}")
            time.sleep(5)


if __name__ == "__main__":
    main()
