# Example Test Plan

Behavior: pagination returns the next distinct page.

Unit: cursor encoding and decoding.

Integration: query receives decoded bounds and returns ordered records.

Boundary: empty page, last page, duplicate timestamps, malformed cursor.

Regression: existing non-paginated request remains valid.
