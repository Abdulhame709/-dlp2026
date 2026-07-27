# 25. Stripe Subscriptions & Billing Architecture

**Author:** SaaS Billing Lead & SRE Accountant  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Subscription Plans Configuration

Cortex AI defines three tiers of multi-tenant service plans to drive SaaS monetization from day one:

- **Free Tier:** Includes basic task boards, limited mock AI assistant requests, and basic weekly productivity summaries.
- **Pro Tier:** Includes full advanced AI planning, unlimited conversation sessions, advanced calendar timeslots scheduling, and habit streak logs.
- **Enterprise Tier:** Includes multi-team workspaces, advanced role permissions, custom analytics logs, and dedicated security controls.

---

## 2. Mock Payment Integration (Stripe Checkout)

To prepare the platform for real-world transactions without making premature cloud calls, we deploy the **Mock Payment Provider** (`src/features/billing/mock-payment-provider.ts`):

- **Stripe Checkout Sessions:** Mocks checkout sessions generation by returning encrypted testing urls (`https://checkout.stripe.mock/pay/...`).
- **Subscription Service (`src/features/billing/subscription-service.ts`):** Orchestrates plans and updates user tiers in PostgreSQL, broadcasting a `'SUBSCRIPTION_CHANGED'` event across the central `EventBus` to notify AI engines to lift usage caps.
