# Security Specification for Cluky Book for Kids

## 1. Data Invariants
1. **User Invariant:** A user can only write their own profile (`request.auth.uid == userId`). The `userId` property must match `request.auth.uid`.
2. **Post Invariant:** A user can only create posts where `authorId == request.auth.uid`. Post updates can only increment likes, commentsCount, or change approval status if parent.
3. **Comment Invariant:** Comments can only be created by signed-in users with `authorId == request.auth.uid`.
4. **Conversation Invariant:** Only conversation participants can read or create messages within that conversation.
5. **Message Invariant:** A user can only send messages where `senderId == request.auth.uid` and within a conversation where they are in `participants`.
6. **Safety Invariant:** All content strings must be bounded in length to prevent denial-of-wallet and injection attacks.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Impersonate Post Author):** Setting `authorId: 'victim-uid'` when authenticated as `attacker-uid`.
2. **Payload 2 (Unauthenticated Post Creation):** Sending a post creation write without any auth token (`request.auth == null`).
3. **Payload 3 (Oversized Post Content):** Sending a post content string exceeding 3,000 characters to bloat storage.
4. **Payload 4 (Ghost Fields on Profile):** Injecting an unauthorized field `isAdmin: true` into `users/{userId}`.
5. **Payload 5 (Eavesdropping Conversations):** Reading `conversations/{conversationId}` when `request.auth.uid` is not in `participants`.
6. **Payload 6 (Forged Sender in Chat):** Inserting a chat message where `senderId` is spoofed to another child.
7. **Payload 7 (Mass Injection via ID Poisoning):** Trying to write to a document with 2000 junk characters in `{postId}`.
8. **Payload 8 (Modifying Immutable Author in Post):** Attempting an update to rewrite `authorId` or `createdAt`.
9. **Payload 9 (Unapproved Message Injection):** Sending a message into a conversation between two foreign users.
10. **Payload 10 (Negative Likes Attack):** Updating a post's `likes` field to a negative number or arbitrary string.
11. **Payload 11 (Deleting Other User's Post):** Attempting to delete someone else's post without parent authorization.
12. **Payload 12 (Foreign Comment Tampering):** Modifying or deleting a comment written by a different author.

## 3. Test Runner Specification (`firestore.rules.test.ts`)
All twelve payloads must be rejected by Firestore Security Rules with `PERMISSION_DENIED`.
