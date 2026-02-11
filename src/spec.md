# Specification

## Summary
**Goal:** Fix the Motoko compilation error in `backend/main.mo` by making `isVerifier(caller : Principal) : Bool` reliably return the admin-check boolean so the canister deploys and authorization logic works as intended.

**Planned changes:**
- Update `isVerifier` to always return the `Bool` result of `AccessControl.isAdmin(accessControlState, caller)` (no missing/implicit return paths).
- Ensure `backend/main.mo` compiles cleanly and existing call sites (`getAchievement`, `getAchievementsByStudentId`, `searchAchievements`) continue to use the same verifier/admin visibility behavior.

**User-visible outcome:** The canister compiles and deploys successfully, and verifier/admin-based access checks behave consistently wherever `isVerifier` is used.
