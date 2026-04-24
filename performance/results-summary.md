# JMeter Results Template

Run the attached `yelp-lab2-plan.jmx` at these concurrency levels.
If Apache JMeter is installed locally, you can use `./performance/run-jmeter.sh` to execute all five runs and generate per-run HTML reports under `performance/runs/`.

- 100 users
- 200 users
- 300 users
- 400 users
- 500 users

Capture for each run:

- Average response time
- Throughput
- Error rate

Suggested table:

| Users | Avg Response Time (ms) | Throughput (req/s) | Error Rate (%) | Notes |
|---|---:|---:|---:|---|
| 100 |  |  |  |  |
| 200 |  |  |  |  |
| 300 |  |  |  |  |
| 400 |  |  |  |  |
| 500 |  |  |  |  |

Graph requirement:

- X-axis: concurrent users
- Y-axis: average response time

Analysis prompts:

- Explain where response time starts growing non-linearly.
- Note whether MongoDB, Kafka, or frontend-facing APIs become the main bottleneck.
- Call out any error spikes and whether they correlate with review-processing throughput.
