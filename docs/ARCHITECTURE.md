# System Architecture Diagram

This diagram illustrates the "Split Brain" architecture of Hunzal People OS, integrating the Modern Frontend, Robust Backend, and AI Analyzer layer.

```mermaid
graph TD
    subgraph "Frontend (React + Vite)"
        UI["Main UI Layer"]
        Store["Zustand Store (orgStore, authStore)"]
        API_Client["API Service (axios)"]
    end

    subgraph "Backend Layer (FastAPI)"
        API["FastAPI Endpoints"]
        Auth["JWT Authentication"]
        CRUD["CRUD Business Logic"]
        SQLAlchemy["SQLAlchemy ORM"]
    end

    subgraph "Intelligent Layer (AI Analyzer)"
        Analyzer["AI Analyzer Engine"]
        Context["Prompt Context Manager"]
    end

    subgraph "Persistence Layer (SQLite)"
        DB[("hunzal_hcm.db")]
    end

    %% Connections
    UI --> Store
    Store --> API_Client
    API_Client -- "HTTPS / JWT" --> API
    API --> Auth
    API --> CRUD
    CRUD --> SQLAlchemy
    SQLAlchemy --> DB
    
    API_Client -- "Analysis Requests" --> Analyzer
    Analyzer --> API
    Analyzer -- "Database Insights" --> DB
```

## Data Flow: Sub-Department Persistence
```mermaid
sequenceDiagram
    participant User
    participant UI as OrgSetup.tsx
    participant Store as useOrgStore
    participant API as api.ts
    participant Backend as FastAPI (main.py)
    participant DB as SQLite

    User->>UI: Save Sub-Department
    UI->>Store: addSubDepartment(data)
    Store->>API: saveSubDepartment(data)
    API->>Backend: POST /api/sub-departments
    Backend->>Backend: Validate Schema (Pydantic)
    Backend->>DB: INSERT INTO sub_departments
    DB-->>Backend: Success (row)
    Backend-->>API: 200 OK (saved data)
    API-->>Store: Return Saved Object
    Store-->>UI: Update Local State
    UI-->>User: Show Toast & Update Tree
```
