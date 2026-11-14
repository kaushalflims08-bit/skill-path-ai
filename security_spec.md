# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. Every document in `users` is keyed by `{userId}` matching `request.auth.uid` and cannot be read or listed by any other user (PII protection for email & academic profile).
2. Every document in `skills`, `assessments`, `assessment_attempts`, `roadmaps`, `progress`, `projects`, `achievements`, `xp_transactions`, `ai_conversations`, and `agent_workflows` must carry `userId == request.auth.uid`.
3. Every write must pass strict `isValid[Entity](incoming())` key-allowlist (`hasAll` + `hasOnly`), type, size, and `request.time` timestamp validation.
4. `assessment_attempts`, `xp_transactions`, `achievements`, and `agent_workflows` are immutable/append-only records (no client delete; no client score/XP tampering after creation).
5. `roadmaps` cannot be deleted by clients to preserve learning history across career goal changes and adaptations.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Cross-user profile read**: Authenticated User A requests `GET /users/{userB}` -> Denied (`!isOwner(userId)`).
2. **Blanket user list scraping**: Authenticated User A runs `LIST /users` -> Denied (`allow list: if false`).
3. **Spoofed userId on create**: User A creates `/skills/doc1` with `userId: userB` -> Denied (`incoming().userId == request.auth.uid`).
4. **Shadow/Ghost field injection**: User A creates `/users/{userA}` with extra field `isAdmin: true` -> Denied (`hasOnly` check fails).
5. **Client timestamp forgery**: User A creates `/xp_transactions/tx1` with backdated `createdAt` != `request.time` -> Denied (`incoming().createdAt == request.time`).
6. **ID poisoning (oversized or invalid chars)**: User A writes `/projects/../../evil` or 200-char ID -> Denied (`isValidId` fails).
7. **Array flooding**: User A writes `/assessments/a1` with `topics` size > 20 -> Denied (`data.topics.size() <= 20`).
8. **Score/XP tampering on update**: User A updates `/xp_transactions/tx1` to raise `amount` from 20 to 5000 -> Denied (`allow update: if false`).
9. **Learning history deletion**: User A deletes `/roadmaps/v1` or `/assessment_attempts/a1` -> Denied (`allow delete: if false`).
10. **Immutable ownerId hijack on update**: User A updates `/projects/p1` changing `userId` to `userB` -> Denied (`incoming().userId == existing().userId`).
11. **Oversized string DoS**: User A writes `/ai_conversations/m1` with `content` > 8000 chars -> Denied (`data.content.size() <= 8000`).
12. **Unverified user write**: Unauthenticated or unverified email user attempts write -> Denied (`isVerifiedUser()` fails).
