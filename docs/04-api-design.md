# 04. API Design & Endpoint Specifications

## 1. REST API Design Standards
All external and internal REST APIs in Cortex AI follow these rules:
- **Base Versioning Path:** `/api/v1/`
- **Payload Format:** JSON (`application/json`)
- **Security:** All private endpoints require a Bearer JWT Token in the `Authorization` header.

### Success Response Standard:
```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully.",
  "timestamp": "2026-07-27T20:45:00.000Z"
}
```

### Error Response Standard:
```json
{
  "status": "error",
  "code": "BAD_REQUEST",
  "message": "The request body contains invalid parameter types.",
  "details": {
    "due_date": "Expected timestamp string, got integer"
  },
  "timestamp": "2026-07-27T20:45:00.000Z"
}
```

---

## 2. API Endpoint Layout

### 2.1 Authentication & Session Endpoints
- `POST /api/v1/auth/register` - Create user profile.
- `POST /api/v1/auth/login` - Initiate session and obtain JWT.
- `POST /api/v1/auth/logout` - Invalidate active session.
- `POST /api/v1/auth/password-reset` - Trigger reset sequence.

### 2.2 Task Management Endpoints
- `GET /api/v1/tasks` - Retrieve tasks. Supports pagination (`?page=1&limit=25`) and filters (`?status=INBOX&priority=HIGH`).
- `POST /api/v1/tasks` - Create a new task.
- `GET /api/v1/tasks/{id}` - Fetch single task.
- `PATCH /api/v1/tasks/{id}` - Update task fields.
- `DELETE /api/v1/tasks/{id}` - Soft-delete or archive task.
- `POST /api/v1/tasks/{id}/complete` - Explicitly complete task and trigger telemetry event.

### 2.3 AI Assistant (MVP Scope)
- `POST /api/v1/ai/assistant/chat` - Conversational endpoint.
  *Request:*
  ```json
  {
    "conversation_id": "optional-uuid",
    "message": "Break down my project 'Annual Audit Report' into tasks."
  }
  ```
  *Response:*
  ```json
  {
    "status": "success",
    "data": {
      "reply": "Here is your structured task list for the Annual Audit Report:",
      "suggested_tasks": [
        { "title": "Collect financial accounts files", "priority": "HIGH" },
        { "title": "Audit tax declarations", "priority": "CRITICAL" },
        { "title": "Compile summary brief", "priority": "MEDIUM" }
      ]
    }
  }
  ```

### 2.4 Event Analytics Telemetry
- `POST /api/v1/telemetry/track` - Internal/Client event logging.
  *Request:*
  ```json
  {
    "event_name": "feature_used",
    "metadata": {
      "feature_name": "ai_assistant_panel",
      "interaction": "expand_window"
    }
  }
  ```

---

## 3. Standard HTTP Status Codes

| Code | Standard Label | Applied Scenario |
| :--- | :--- | :--- |
| **200** | `OK` | Standard successful read or write query. |
| **201** | `Created` | Entity (Task, Project, Organization) created successfully. |
| **400** | `Bad Request` | Incorrect payload, validation error, missing params. |
| **401** | `Unauthorized` | Invalid, missing, or expired JWT bearer token. |
| **403** | `Forbidden` | RLS restriction, tenant breach, unauthorized role. |
| **404** | `Not Found` | Task or requested resource does not exist. |
| **429** | `Too Many Requests` | Rate limiter triggered. |
| **500** | `Internal Server Error` | Database connection pool error, server failure. |
