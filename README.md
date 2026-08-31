<p align="center">
  <a href="https://binaziz.alsaiftech.online">
    <h1 align="center">BinAziz Store</h1>
  </a>
</p>

<h3 align="center">
  A modern Saudi e-commerce platform powered by Medusa & Next.js
</h3>

<p align="center">
  A full-featured online store for BinAziz, built with a modern,
  scalable and API-first commerce architecture.
</p>

<p align="center">
  <a href="https://docs.medusajs.com">
    <img src="https://img.shields.io/badge/Medusa-2.x-6366F1" alt="Medusa" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
  </a>
  <a href="https://www.postgresql.org">
    <img src="https://img.shields.io/badge/PostgreSQL-17-336791" alt="PostgreSQL" />
  </a>
  <a href="https://www.docker.com">
    <img src="https://img.shields.io/badge/Docker-Containerized-2496ED" alt="Docker" />
  </a>
</p>

---

# BinAziz Store

**BinAziz Store** is a modern e-commerce platform developed for **BinAziz**, designed to provide customers with a complete online shopping experience.

The platform allows customers to browse products, select product variants, add items to their cart, complete checkout, choose shipping methods, and make payments online.

The system is built using an **API-first architecture**, with Medusa powering the commerce backend and Next.js providing the customer-facing storefront.

The project is designed with the Saudi Arabian market in mind, including support for:

- Saudi Riyal (SAR)
- Saudi Arabia as the primary market
- Local shipping providers
- Online payment providers
- Customer accounts
- Arabic and English experiences
- Product and inventory management
- Order management

## ✨ Features

### 🛍️ Storefront

- Modern responsive storefront
- Product catalog
- Product variants
- Product images
- Product search and browsing
- Shopping cart
- Promotion codes
- Multi-step checkout
- Customer accounts
- Customer addresses
- Order history
- Order management

### 💳 Payments

The platform is designed to support online payments through payment providers suitable for the Saudi market.

Current payment integration:

- Moyasar
- Saudi Riyal (SAR)

### 🚚 Shipping

The store uses a custom fulfillment integration to connect Medusa with shipping providers.

Supported shipping services include:

- OTO
- SMSA
- Aramex
- RedBox

The shipping system is designed so additional shipping providers can be integrated without changing the core storefront.

### 👤 Customer Accounts

Customers can:

- Create an account
- Sign in
- Manage their profile
- Manage addresses
- View previous orders
- Track their purchases

### ⚙️ Admin Dashboard

The store uses the **Medusa Admin Dashboard** for managing the commerce platform.

Administrators can manage:

- Products
- Product variants
- Inventory
- Orders
- Customers
- Regions
- Shipping options
- Payment providers
- Promotions
- Product categories
- Sales channels

Admin dashboard:

`https://binaziz.alsaiftech.online/app`

---

# 🏗️ Architecture

The project follows a separated frontend/backend architecture:

```text
                    ┌──────────────────────┐
                    │       Customer       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Nginx / SSL     │
                    │    Reverse Proxy      │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌───────────────────┐             ┌───────────────────┐
    │   Next.js Store   │             │  Medusa Backend   │
    │      :8000        │             │      :9000        │
    └───────────────────┘             └─────────┬─────────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              │                 │                 │
                              ▼                 ▼                 ▼
                       ┌────────────┐    ┌────────────┐    ┌────────────┐
                       │ PostgreSQL │    │   Redis    │    │ External   │
                       │     DB     │    │   Cache    │    │ Services   │
                       └────────────┘    └────────────┘    └────────────┘
