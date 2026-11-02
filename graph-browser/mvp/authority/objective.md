# Root-user and scoped-agent authority

## Desired outcome
The root user can edit across the graph while each agent is constrained to its granted scope and protected-field permissions.

## Acceptance criteria
- Establish trusted server-side root/agent identity; never trust a client-supplied role or scope.
- Permit root edits to full objectives across the graph, including founder intent; retain explicit control of permission changes.
- Reject agent writes outside scope or to protected intent/directives without authorization, including path and symlink bypasses.
- Recheck current permissions and inherited directives when accepting writes and commits; test revocation during an agent run.
- Define the supported agent write entry point and filesystem isolation boundary. Do not claim enforcement for agents with unrestricted direct repository access.

<!-- oasis:working-state -->
## Status
Not started. Existing app has no identity model and protects all initial objective text uniformly.

## Next action
Specify and test the smallest trusted local root session and scoped agent write interface before enabling full-text writes.
