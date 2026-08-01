# Cortex AI - SaaS Monetization & Pricing Model

**Author:** SaaS Product Management & Finance  
**Version:** v1.0  

---

## 1. Subscription Tiers Comparison

Cortex AI operates on a tiered SaaS Freemium subscription model:

| Feature / Plan | Free Tier | Pro Tier | Enterprise Tier |
| :--- | :--- | :--- | :--- |
| **Monthly Price** | `$0.00` | `$19.99` | Custom / Negotiated |
| **Workspace Users**| Max 3 members | Max 20 members | Unlimited |
| **AI Assistant** | 10 requests/day | Unlimited | Unlimited |
| **AI Daily Planner**| Disabled | Enabled (Advanced) | Custom SLA |
| **Daily Token Cap**| 10K tokens | 150K tokens | 1M+ tokens |
| **Storage Bucket** | 500MB max | 10GB private | Dedicated bucket / 500GB+ |
| **Security Controls**| Standard | RLS + RBAC | SSO / SAML + Audit Logs |

---

## 2. Stripe Webhook & Invoices Integration

Stripe webhooks handle subscriptions state changes asynchronously inside our billing services:
- **`customer.subscription.created`:** Hydrates database subscription records and upgrades user limits.
- **`customer.subscription.deleted`:** Downgrades the organization workspace back to the `FREE` tier, enforcing maximum user limits.
