# 16. AI Core & Orchestration Architecture

**Author:** Chief AI Architect & Machine Learning Engineer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. AI Intelligence Orchestration Layer Topology

Cortex AI implements a highly modular, decoupled **Intelligence Orchestration Layer** (`src/features/ai/core/`):

```
                        [ AIAssistantService ]
                                  │
                                  ▼
                        [ AIService Orchestrator ] ───► [ Security Check / Sanitizer ]
                                  │                                  │
                                  ▼ (Model Switching Fallbacks)      ▼ (Blocks injections)
                         [ IAIProvider Interface ]
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
          [ OpenAIProvider ] [ AnthropicProvider ] [ MockAIProvider ]
```

- **Unified Interface (`IAIProvider`):** Abstracted contract managing text generations, structured output mapping, and token estimators. Permits swapping providers (OpenAI, Claude, Gemini) dynamically at runtime (for model fallbacks or cost optimization) with zero code modifications inside features or pages.
- **Structured Schema Enforcers:** Prevents model hallucinations and invalid JSON formats by enforcing strict Zod schema parsing and verification upon all outputs.

---

## 2. Context Pipeline Architecture (`AIContextManager`)
Before transmitting prompts to the active AI model, the context manager compiles user configurations, recent metrics, and tasks into high-density contexts:
- **`UserContextBuilder`:** Pulls preferences, timezone, and behavioral performance metrics into token-optimized `<user_context>` XML.
- **`TaskContextBuilder`:** Pulls uncompleted tasks and nested checklist outlines into `<active_tasks_context>` XML.
- **`OrganizationContextBuilder`:** Pulls tenant metadata parameters into XML.

---

## 3. Dual Memory System Architecture

To deliver deeply personalized experiences, Cortex AI deploys a two-tier memory system:

### 3.1 Short-Term Memory (`ShortTermMemoryManager`)
- **Retention:** Active session-bound memory map.
- **Capacity:** Sliding window containing the last 10 conversational exchanges, ensuring the model retains dialogue thread context without exhausting token limits.

### 3.2 Long-Term Memory (`LongTermMemoryManager`)
- **Retention:** Persistent, database-backed.
- **Database Model:** Mapped to PostgreSQL `ai_memory` table. Ready to support `pgvector` multi-dimensional embeddings similarity indexing for semantic RAG lookups in subsequent phases.
- **Metadata Attributes:** Tags category types (`PREFERENCE`, `GOAL`, `WORK_PATTERN`, `BEHAVIOR`) and tracks importance scores.
- **Privacy Dashboard Compliance:** Users retain absolute, GDPR-compliant controls to query, edit, selectively delete, or completely erase stored memory vectors.
