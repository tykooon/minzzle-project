---
name: Branch hygiene before switching
description: Always commit or stash all related changes before switching branches — never leave a feature branch in an inconsistent state
type: feedback
originSessionId: 066b104f-cdec-445d-aab1-48b4c71fbf42
---
Before switching away from a feature branch, ensure it is in a self-contained, consistent state: all related changes committed (or stashed). Never `git restore` or discard working-tree changes without first verifying they are safely preserved somewhere.

**Why:** Page integrations for `feature/tutorial-pages` were accidentally lost because they were reverted on `main` before being committed to the feature branch. Another session (or another machine) had no way to recover them.

**How to apply:** When asked to switch branches or go back to `main`, always check `git diff` and `git status` first. If there are unstaged changes related to the current task, commit or stash them to the feature branch before switching. Ask the user if unsure which branch they belong to.
