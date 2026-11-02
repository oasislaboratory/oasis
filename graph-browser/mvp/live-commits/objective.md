# Fast commits and fresh agent updates

## Desired outcome
Authorized edits become Git commits quickly, and agent updates reconcile with current user changes before being accepted.

## Acceptance criteria
- Measure edit-to-save/commit latency and test a bounded debounce/batching policy; preserve Git history and keep remote push explicit.
- Carry the agent's base objective, inherited-directive, permission, and relevant repository revisions; compare again at the write/commit boundary.
- Reject stale writes and surface a conflict; require fresh reads and reconciliation before retrying. Preserve user drafts and unrelated changes.
- Coordinate write and commit operations so races, concurrent tabs, staged files, and commit failure cannot silently overwrite user changes or include unauthorized work.
- Test user edits and permission revocation during an agent run, allowed retries, rejected out-of-scope updates, and persistence after reload.

<!-- oasis:working-state -->
## Status
Not started. The baseline has per-process serialization, content/directive revisions, and manual commits, but no scoped agent integration or coordinated real-time commit loop.

## Dependencies
Root-user/scoped-agent authority and the inline editor experiment.

## Next action
Write concurrency tests around the authorized write boundary, then connect the editor and agent interface to the measured commit loop.
