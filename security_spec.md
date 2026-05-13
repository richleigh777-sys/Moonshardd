# Nexus CRM Security Specification

## Data Invariants
1. A Sale cannot exist without a `serverId` and `agentId`.
2. A Note must have a `type` ('note' or 'callback').
3. Agents can only see and edit their own Sales unless they are Admins.
4. Retention data (LTV) can only be updated by verified transactions.

## The Dirty Dozen (Attack Payloads)

1. **Identity Spoofing (Sale)**: Agent A attempts to create a sale with `agentId` of Agent B.
2. **Privilege Escalation**: Agent A attempts to change their own `role` to 'admin' in the `users` collection.
3. **Ghost Field Write**: Agent A attempts to update a sale with a `isVerified: true` field.
4. **ID Poisoning**: Attempt to create a note with a 1MB string as the ID.
5. **Terminal State Bypass**: Attempt to update a 'Resolved' note back to 'Active'.
6. **Relational Orphan**: Attempt to create a note for a server that doesn't exist.
7. **PII Leak**: Authenticated Agent A attempts to read Agent B's GCash details.
8. **Shadow Account**: Attempt to create a `Server` without an `accessKey`.
9. **Timestamp Manipulation**: Attempt to set `createdAt` in the future.
10. **Resource Exhaustion**: Attempt to write a 1MB note content.
11. **Negative Revenue**: Attempt to create a sale with `amount: -1000`.
12. **Unauthorized Metadata**: Attempt to add sensitive tags like `[INTERNAL_SYSTEM_OVERRIDE]` to a lead.

## Test Runner (Logic Check)
The `DRAFT_firestore.rules` must be verified against these scenarios.
