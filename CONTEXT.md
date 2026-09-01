# Domain context

## Glossary

- **Product**: an item offered for sale in the catalog. It has an id, name, description, price, stock and a Category.
- **Category**: a grouping used to browse the catalog (e.g. electronics, clothing).
- **Catalog**: the published collection of Products that can be filtered by Category.
- **Cart**: the current selection of products the buyer is considering purchasing.
- **CartLine**: a Product plus the quantity the buyer wants to add to the Cart.
- **Customer**: the contact data (name, phone, email) attached to an Order. A Customer is not an account: guests can place Orders without a User.
- **User**: an authenticated account (email/password). A User who places an Order gets that Order linked to them and can see it in their order history.
- **Admin**: a User with the elevated `admin` role. Admins manage Products, Categories, and Order statuses through the admin dashboard. The role lives in the auth token, not in an editable document.
- **Order**: a confirmed purchase. Contains the Customer, the CartLines, the total price, a timestamp, an OrderStatus, and optionally the User who placed it.
- **OrderStatus**: the lifecycle state of an Order: `pending` → `paid` → `shipped` → `delivered`, or `cancelled`.
- **OrderId**: the identifier generated when an Order is persisted.
- **PaymentGateway**: the abstraction a store uses to charge the Customer for an Order.
