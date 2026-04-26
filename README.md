# SnP Brand — E-commerce Platform

> A production e-commerce platform built to solve a real scaling problem: managing 2,000+ product sales without being chained to WhatsApp.

## The Problem

SnP Brand sells premium slippers and shirts in Ghana. As sales grew past 2,000 units, manually handling every customer inquiry and order over WhatsApp became a bottleneck. Subscribing to Shopify or similar platforms was not financially viable. So I built one.

## What It Does

A full-stack e-commerce platform handling real customer transactions end-to-end:

- Customers browse, filter, and purchase products with a seamless checkout flow
- Payments are processed live via **Paystack** integration (real transactions)
- Order confirmation emails are automatically triggered via **Supabase Edge Functions** and sent through **Resend**
- An internal inventory dashboard lets co-owners track stock levels, orders, and sales in real time
- The platform is live and serving real customers

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Supabase (PostgreSQL), Edge Functions |
| Payments | Paystack API |
| Email | Resend (via Edge Function triggers) |
| Build | Vite |

## Architecture

```
Customer Browser
      │
      ▼
React Frontend (Vite + TypeScript)
      │
      ├──▶ Supabase DB (products, orders, inventory)
      │
      ├──▶ Paystack API (payment processing)
      │
      └──▶ Supabase Edge Functions
                  │
                  └──▶ Resend API (order confirmation emails)
```

## Key Technical Challenges

**Payment Integration**
Integrating Paystack required handling async payment verification, webhook callbacks, and ensuring orders only confirmed after successful payment — not just after redirect.

**Edge Function Triggers**
Built serverless Edge Functions that fire automatically on order creation to dispatch confirmation emails via Resend, keeping the frontend decoupled from email logic.

**Backend-Frontend Data Sync**
Designed the Supabase schema and real-time queries to keep the customer-facing store and the internal inventory dashboard in sync without duplication.

## Inventory Dashboard

A separate internal dashboard for co-owners to:
- View current stock levels per product
- Track orders and fulfilment status
- Monitor sales over time

*Actively being improved.*

## What I Learned

This was my first full-stack production project. I had no prior experience with backend integration, payment APIs, or serverless functions — I learned each layer by solving a real problem I owned. The constraint of building for a live business with real customers forced a standard of reliability I wouldn't have held myself to on a tutorial project.

## Live

The platform is live and actively used. Link available on request.
 
## Built by

Sylvester Anderson — CS student, KNUST | Co-founder, SnP Brand
