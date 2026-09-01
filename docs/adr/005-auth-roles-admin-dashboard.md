# ADR 005: Auth with custom-claim roles and in-SPA admin dashboard

## Status

Accepted

## Context

The template needs an admin dashboard where a store owner manages Products,
Categories, and Order statuses, plus customer accounts with order history. This
requires distinguishing three actors: guests (anonymous buyers), Users
(authenticated customers), and Admins.

The dangerous decision is *where the admin role lives*. Options considered:

1. **Custom claims on the Firebase Auth token.** The `admin: true` claim is set
   with the Admin SDK (local script, works on the Spark plan) and is part of the
   signed JWT. Firestore Rules check `request.auth.token.admin == true`. Cannot
   be forged or self-assigned from the client; costs no extra reads.
2. **An `admins/{uid}` whitelist collection.** Visible in the console but costs
   one `exists()` read per operation and adds a document that a rules mistake
   could expose to writes.
3. **A `role` field on a user profile document.** Simplest to build and the most
   dangerous: any rules bug that lets a user write their own profile becomes
   privilege escalation.

A second decision is whether the dashboard is a separate app or a route subtree.
A separate app duplicates config/deploys; a route subtree risks shipping admin
code to the public bundle unless it is code-split.

## Decision

1. Use **Firebase Auth (email/password)** for customer accounts and admins.
2. Store the admin role as a **custom claim** (`admin: true`), assigned by a
   local script (`scripts/set-admin.js`) using the Admin SDK and a service
   account. Revoking works the same way (`--remove`).
3. Keep **guest checkout**: an Order may exist without a User. When a logged-in
   User places an Order, the order document stores their `uid`, and rules allow
   that User to read only their own orders (`resource.data.uid == request.auth.uid`).
4. Host the dashboard **inside the same SPA under `/admin`**, lazy-loaded with
   `React.lazy` so the admin bundle is only downloaded after an admin logs in.
5. Enforce everything in **Firestore Rules**, not in React: product/category
   writes and order-status updates require the `admin` claim; route guards in
   the SPA are UX only.
6. Categories move from `clientConfig` to a `categories` collection (public
   read, admin write) so the client can manage them; `clientConfig` remains the
   fallback when Firebase is not configured.

## Consequences

- The client-side `AdminRoute` guard is convenience, not security; an attacker
  loading admin JS chunks gains nothing because every privileged write is
  rejected by rules without the claim.
- After granting/revoking the claim, the affected user must refresh their ID
  token (re-login or `getIdToken(true)`) for the change to take effect.
- Order documents gain optional `uid` and a `status` field; `firestore.rules`,
  `saveOrder`, and the admin dashboard must stay in sync on that shape
  (fail-closed if they drift).
- The public catalog keeps working with zero Firebase config (mock mode); auth
  and the dashboard require a configured project.
