# Next steps

The canonical mutable handoff is [../../NEXT_STEPS.md](../../NEXT_STEPS.md). Keep implementation steps there to avoid duplicate task lists.

The native contract is defined in `NATIVE_AUTH_CONTRACT.md`. Token persistence, password buyer login, and refresh rotation implementation are complete. The next prerequisite is an isolated MongoDB replica-set and HTTP verification of refresh rotation; do not begin reuse detection or scaffold Expo before it passes.
