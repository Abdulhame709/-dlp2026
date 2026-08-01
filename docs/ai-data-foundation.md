# 15. AI Prompt Context & Data Preparation Layer

**Author:** Chief AI Architect & Prompt Engineering Specialist  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. AI Context Builder Architecture

To enable future AI planners, schedulers, and coaches to perform accurate, personalized, and context-aware generations without high token overhead, Cortex AI deploys a dedicated **Data Preparation Layer** (`src/features/ai/context/`):

```
┌────────────────────────────────────────────────────────┐
│               AI DATA PREPARATION LAYER                │
│                                                        │
│   [ UserContextBuilder ]     ➔ Resolves preferences,   │
│                                 scores, and behaviors  │
│                                                        │
│   [ TaskContextBuilder ]     ➔ Resolves active tasks   │
│                                 and checklist lists    │
│                                                        │
│   [ OrgContextBuilder ]      ➔ Resolves workspace keys │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼ (Compiles and optimizes)
               [ Standardized XML Prompt Context ]
                           │
                           ▼ (Transmitted safely via TLS)
                 [ Large Language Model ]
```

---

## 2. Token-Optimized XML Context Schemas
Cortex AI standardizes all compiled data inside semantic XML blocks. XML is highly structured, and modern LLMs (like Claude and GPT-4) can easily parse, categorize, and execute actions based on XML structures with maximum token efficiency.

### 2.1 User Profile Context Schema
Gathers active working hours, focus habits, and average completion metrics:
```xml
<user_context>
  <user_id>11111111-1111-1111-1111-111111111111</user_id>
  <profile>
    <preferred_working_hours>
      <start>09:00</start>
      <end>17:00</end>
    </preferred_working_hours>
    <favored_categories>Database, AI Engineering</favored_categories>
  </profile>
  <intelligence_profile>
    <productivity_pattern>Peak efficiency detected between 9 AM and 12 PM.</productivity_pattern>
    <completion_behavior>Completes critical tasks 1.4x faster before noon.</completion_behavior>
    <delay_frequency_percentage>12%</delay_frequency_percentage>
  </intelligence_profile>
</user_context>
```

### 2.2 Active Task List Context Schema
Gathers all current active uncompleted task parameters:
```xml
<active_tasks_context>
  <task id="task-uuid-1">
    <title>Deploy Database Schema with RLS</title>
    <status>IN_PROGRESS</status>
    <priority>CRITICAL</priority>
    <description>Configure and test Supabase PostgreSQL security policies.</description>
  </task>
</active_tasks_context>
```
Using this clean context structure, we prevent transferring unrelated fields (like soft delete records, historical updates, and internal audit columns), reducing the model's cognitive load and optimizing costs.
