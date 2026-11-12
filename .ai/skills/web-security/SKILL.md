---
name: web-security
description: This skill should be used for browser-facing code involving untrusted input, authentication, cookies, redirects, uploads, third-party scripts or client configuration.
---

# Web Security Skill

Treat client input as attacker-controlled data and the browser as an untrusted environment.

Inspect XSS and unsafe DOM sinks, URL handling, authentication and authorization boundaries, cookie sessions, CSRF where applicable, CSP, third-party scripts, client-exposed configuration, secret leakage, uploads, redirects and dependency trust boundaries.

Prefer framework-supported escaping and safe abstractions. Never move secrets to the browser to simplify implementation.