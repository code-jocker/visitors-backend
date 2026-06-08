# TODO

## Fix runtime configuration
- [ ] Ensure `.env` contains required DB variables, especially `DB_NAME`.
- [ ] Resolve `JWT Auth Error: No database selected` (likely MySQL DB not selected/connected due to missing `DB_NAME`).

## Fix Numverify 401 (only after backend runs correctly)
- [ ] Locate the actual Numverify callsite from logs (requires log line with `Numverify request failed: 401 ... invalid_access_key` including URL/file:line).
- [ ] Patch integration to use the correct env var + `apikey` header format for apilayer/numverify.

