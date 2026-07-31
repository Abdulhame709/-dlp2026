# Cortex AI - Customer Support & Ticketing Playbook

**Author:** Customer Success & Support SRE  
**Version:** v1.0  

---

## 1. Ticketing Ingestion Channels

During our Private Beta phase, users can request technical support and file bug reports through two primary channels:
1. **In-App Feedback Panel:** Clicking "Feedback" inside the sidebar captures screenshots, device context, and dispatches a ticket.
2. **Dedicated Email Support:** Sending a message to `support@cortexai.com` automatically creates a ticket in our help desk.

---

## 2. Escalation & Priority Matrix

Support tickets are categorized based on operational impact:

- **P1: Critical Outage / Data Corruption**
  - *SLA Response:* 15 Minutes.
  - *Escalation Path:* Pagers CISO and SRE Leads.
- **P2: Core Feature Failure (e.g. AI Planner not scheduling)**
  - *SLA Response:* 2 Hours.
  - *Escalation Path:* Notifies engineering on-call.
- **P3: Minor UI Glitch / Typo**
  - *SLA Response:* 24 Hours.
- **P4: Feature Request / AI Suggestion Rating Feedback**
  - *SLA Response:* 48 Hours.
