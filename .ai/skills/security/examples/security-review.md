# Example Security Review

Scope: new file-upload endpoint.

Findings: validate content type and size, store outside executable paths, enforce authorization, randomize object identifiers, avoid trusting user-provided filenames, and ensure download responses use safe content-disposition behavior.

Verification: upload authorization tests, malformed-input tests, size-boundary tests, and a review of storage configuration.
