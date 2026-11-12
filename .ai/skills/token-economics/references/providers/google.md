# Google Gemini Provider Notes

Verify current details before using them for billing decisions.

Relevant official documentation:

- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Context caching: https://ai.google.dev/gemini-api/docs/caching

Implementation implications:

- context caching has distinct token and storage pricing;
- batch/flex modes can have different economics from interactive requests;
- thinking tokens can be included in output billing for models/modes where documented;
- provider pricing and promotions can change on a dated basis, so do not copy current prices into permanent core policy.
