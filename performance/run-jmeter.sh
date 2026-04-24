#!/usr/bin/env bash

set -euo pipefail

if ! command -v jmeter >/dev/null 2>&1; then
  echo "jmeter is required on PATH to run the Lab 2 load tests." >&2
  exit 1
fi

PLAN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN_FILE="${PLAN_DIR}/yelp-lab2-plan.jmx"
OUTPUT_DIR="${PLAN_DIR}/runs"

USERS=(100 200 300 400 500)
RAMP_SECONDS="${RAMP_SECONDS:-30}"
DURATION_SECONDS="${DURATION_SECONDS:-120}"

mkdir -p "${OUTPUT_DIR}"

for users in "${USERS[@]}"; do
  run_dir="${OUTPUT_DIR}/${users}-users"
  rm -rf "${run_dir}"
  mkdir -p "${run_dir}"

  echo "Running JMeter plan for ${users} users..."
  jmeter -n \
    -t "${PLAN_FILE}" \
    -Jusers="${users}" \
    -Jramp="${RAMP_SECONDS}" \
    -Jduration="${DURATION_SECONDS}" \
    -l "${run_dir}/results.jtl" \
    -e -o "${run_dir}/html-report"
done

echo "JMeter runs complete. Reports are under ${OUTPUT_DIR}."
