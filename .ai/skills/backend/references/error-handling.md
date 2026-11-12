# Error Handling

Handle errors at the layer that has enough context to respond correctly. Do not catch broadly and continue silently. Preserve causal information when rethrowing. Avoid leaking internal details to external clients while retaining useful diagnostic context in controlled logs.
