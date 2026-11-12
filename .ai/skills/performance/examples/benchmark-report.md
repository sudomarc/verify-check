# Example Benchmark Report

Workload: 10,000 orders with the production-like filter distribution.

Baseline: median latency 180 ms over repeated local runs.

Change: add the existing composite index.

Result: median latency decreased under the same workload. The result is local evidence, not a production SLO guarantee.
