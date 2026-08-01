# 27. Product Analytics & Telemetry Guide

**Author:** Senior Product Analyst & Growth Lead  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Growth Telemetry & Event Ingestion Pipeline

To track product usage, feature adoption rates, and user retention natively, Cortex AI maps Growth Signals over our central `EventBus`:

```
[ User Action ] ➔ (1. Broadcast Event) ➔ [ central EventBus ]
                                                   │
                                                   ▼ (2. Dispatches payload)
                                        [ Telemetry Aggregator ]
                                                   │
                                                   ▼ (3. Writes to PostgreSQL logs)
                                        [ public.activity_logs ]
```

---

## 2. Monitored Event Signals Registry

The following product events are tracked, verified, and mapped on the EventBus:

- **`USER_REGISTERED`:** Emitted when a new account is registered. Stores provider (email/OAuth) and locale information.
- **`WORKSPACE_CREATED`:** Emitted when a user configures a personal or organization space. Stores workspace category.
- **`TASK_CREATED`:** Emitted when a task is initialized. Stores priority and estimated completion times.
- **`AI_REQUEST_USED`:** Emitted when an AI chat request completes. Tracks prompt/completion token usage and provider fallbacks.
- **`SUBSCRIPTION_CHANGED`:** Emitted when a user upgrades/downgrades plans. Tracks pricing transformations.
- **`FEATURE_USED`:** Emitted when a user interacts with distinct UI features. Tracks layout changes.
