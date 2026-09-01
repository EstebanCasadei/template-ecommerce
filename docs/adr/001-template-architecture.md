# ADR 001: E-commerce template architecture

## Status
Accepted

## Context

The repo is a React course final project that must also work as a reusable e-commerce template. It needs to be:

- Easy to fork and customize per client.
- Simple enough for the course scope.
- Extensible for real-world features such as payment providers and catalog changes.

## Decision

1. Use **Vite + React with JavaScript**, not TypeScript, because the course examples are in JavaScript and it lowers the barrier for forking by non-TypeScript users.
2. Use **Tailwind CSS** for styling because it keeps the markup configurable and themable through a small `clientConfig` file without touching component files.
3. Organize code in **feature folders** (`catalog`, `cart`, `checkout`, `config`) so each feature owns its domain, application and UI layers.
4. Use a **repository seam** (`ProductRepository`, `OrderRepository`) with a Firebase adapter, so the store can later swap to another backend without touching the UI.
5. Expose a **`useCart()` hook** as the public surface, while the implementation uses React Context to meet the course requirement.
6. Keep one fictional client in `src/features/config/clientConfig.js` and document how to fork the repo and edit that file for a new client.

## Consequences

- Forking the template means copying the repo and changing `clientConfig.js`; no multi-tenant runtime logic is required.
- Payment, catalog and order data can be replaced by editing the adapter or the config.
- The course requirement of using React Context is met without exposing context details to every component.
