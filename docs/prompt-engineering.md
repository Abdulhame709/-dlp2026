# 17. Prompt Engineering & Versioning Guide

**Author:** Prompt Engineering Specialist & AI Developer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Prompt Management Framework

All prompts in Cortex AI are treated as **Versioned Code Assets** under `src/features/ai/prompts/`. Prompts are defined as immutable objects containing version numbers, system instructions, user variables, and expected JSON output schemas.

---

## 2. Active Prompt Registries

### 2.1 Prompt: `taskPrioritizationPrompt` (`v1.0`)
- **System Instructions:** Instructs the model to act as a mathematical priority analyzer, weighing deadline, impact, and historical metrics.
- **Expected JSON Output Schema:**
  ```json
  {
    "taskId": "string",
    "suggestedPriority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "score": 95,
    "reasoning": "string explaining the priority decision"
  }
  ```
- **Variables:** `taskTitle`, `taskDescription`, `goalContext`, `analyticsBehavior`.

### 2.2 Prompt: `dailyPlannerPrompt` (`v1.0`)
- **System Instructions:** Instructs the model to schedule tasks into calendar timeslots according to working hours.
- **Expected JSON Output Schema:**
  ```json
  {
    "date": "YYYY-MM-DD",
    "scheduleBlocks": [
      { "time": "09:00 - 11:00", "taskTitle": "Database setup", "focusLevel": "HIGH" }
    ],
    "focusScoreSuggestion": 85
  }
  ```
- **Variables:** `workingHours`, `planningStyle`, `tasksContext`.

### 2.3 Prompt: `productivityCoachPrompt` (`v1.0`)
- **System Instructions:** Instructs the model to evaluate behavioral patterns and output actionable SRE-style advice.
- **Expected JSON Output Schema:**
  ```json
  {
    "userId": "string",
    "coachingAdvice": "string",
    "recommendedActions": ["string"]
  }
  ```
- **Variables:** `userProfileContext`.

### 2.4 Prompt: `taskBreakdownPrompt` (`v1.0`)
- **System Instructions:** Instructs the model to break a parent task into checklist steps.
- **Expected JSON Output Schema:**
  ```json
  {
    "taskId": "string",
    "subtasks": [
      { "title": "Subtask title", "priority": "HIGH" | "MEDIUM" | "LOW" }
    ]
  }
  ```
- **Variables:** `taskTitle`, `taskDescription`.
