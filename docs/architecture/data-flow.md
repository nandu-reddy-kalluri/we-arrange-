# YMWA — Data Flow Architecture

This document maps how data moves through the YouMarriageWeArrange system layers — from the couple's browser through the server, into Supabase, through the admin portal, and back to the customer dashboard.

---

## 1. Full System Data Flow

```mermaid
flowchart LR
    subgraph Browser["🌐 Browser"]
        A[Customer: Requirements Form]
        B[Customer: Dashboard]
        C[Admin: Admin Portal]
    end

    subgraph NextServer["⚙️ Next.js Server"]
        D[Route Handlers /api/*]
        E[Server Components]
        F[Middleware Auth Guard]
    end

    subgraph Supabase["🗄️ Supabase"]
        G[(requirements)]
        H[(quotes)]
        I[(venues)]
        J[(vendors)]
        K[(shortlists)]
        L[Auth Service]
        M[RLS Policies]
    end

    A -->|POST /api/requirements/submit| D
    D -->|INSERT| G
    G -->|Realtime or poll| C
    C -->|INSERT| H
    H --> G
    G -->|UPDATE status| G
    B -->|GET /api/requirements/me| E
    E -->|SELECT + RLS| G
    E -->|SELECT + RLS| H
    F --> L
    L --> M
    M --> G
    M --> H
    M --> K
```

---

## 2. Requirements Submission Flow

```mermaid
sequenceDiagram
    participant Browser as Browser (React)
    participant API as /api/requirements/submit
    participant DB as Supabase DB
    participant Admin as Admin Portal

    Browser->>API: POST { location, guest_count, budget, event_type }
    API->>API: Validate inputs (Zod schema)
    API->>API: Verify auth session (supabase.auth.getUser)
    API->>DB: INSERT into requirements (status: pending)
    DB-->>API: { id: uuid, status: "pending" }
    API-->>Browser: 201 { requirement_id, message: "Received" }
    DB-->>Admin: Requirement appears in admin list
```

---

## 3. Comparison Sheet Data Flow

```mermaid
sequenceDiagram
    participant Specialist as Admin Portal (Specialist)
    participant QuoteAPI as /api/quotes/create
    participant DB as Supabase DB
    participant CustomerDB as Customer Dashboard

    Specialist->>QuoteAPI: POST { requirement_id, venue_id, base_cost_lakhs, ... }
    QuoteAPI->>QuoteAPI: Verify specialist role (admin only)
    QuoteAPI->>DB: INSERT into quotes (collected_by: specialist_id)
    QuoteAPI->>DB: UPDATE requirements SET status = 'quotes_collected'
    DB-->>CustomerDB: Customer sees status update
    CustomerDB->>DB: GET /api/quotes/compare?requirement_id=...
    DB-->>CustomerDB: { quotes: [...], venues: [...] }
```

---

## 4. Authentication Data Flow

```mermaid
flowchart TD
    Request[HTTP Request] --> MW[src/middleware.ts]
    MW --> SC[supabase.auth.getUser]
    SC --> SB[Supabase Auth Service]
    SB --> TK{Token Valid?}
    TK -->|No| RL[Redirect /login]
    TK -->|Yes| Role{Check user.role}
    Role -->|customer| Cust[Allow /customer/* routes]
    Role -->|admin| Adm[Allow /admin/* routes]
    Role -->|unauthenticated| Pub[Allow /(public)/* routes]
```

---

## 5. Shortlist Data Flow

```mermaid
sequenceDiagram
    participant Couple as Couple (Browser)
    participant ShortlistAPI as /api/shortlist/manage
    participant DB as Supabase DB

    Couple->>ShortlistAPI: POST { venue_id } or { vendor_id }
    ShortlistAPI->>ShortlistAPI: Verify auth, check exactly one of venue_id/vendor_id set
    ShortlistAPI->>DB: UPSERT into shortlists (customer_id, venue_id)
    DB-->>ShortlistAPI: { id: uuid }
    ShortlistAPI-->>Couple: 200 { shortlisted: true }
    Couple->>ShortlistAPI: DELETE { shortlist_id }
    ShortlistAPI->>DB: DELETE FROM shortlists WHERE id = ? AND customer_id = ?
    DB-->>Couple: 204 No Content
```

---

## 6. Service Layer Architecture

All database access must go through the service layer. Direct Supabase client calls are **never permitted inside React components**.

```
Component (TSX)
    ↓
Custom Hook (useRequirements, useShortlist)
    ↓
Service Function (src/services/supabase/ or features/*/services/)
    ↓
Supabase Client (browser or server)
    ↓
Supabase DB (with RLS)
```

### Service File Locations

| Service | File Path |
|:---|:---|
| Supabase browser client | `src/services/supabase/client.ts` |
| Supabase server client | `src/services/supabase/server.ts` |
| Requirements service | `src/features/customer/services/requirements.service.ts` |
| Quotes service | `src/features/quotes/services/quotes.service.ts` |
| Shortlist service | `src/features/shortlist/services/shortlist.service.ts` |
| Venue service | `src/features/venues/services/venues.service.ts` |
| Vendor service | `src/features/vendors/services/vendors.service.ts` |

---

## 7. API Route Handler Pattern

All Route Handlers at `src/app/api/*/route.ts` follow this structure:

```typescript
// 1. Parse and validate request body (Zod)
// 2. Verify authentication (supabase.auth.getUser)
// 3. Verify role authorization if needed
// 4. Call service function (never direct DB call in route handler)
// 5. Return JSON response with correct HTTP status code

export async function POST(request: Request) {
  // 1. Parse
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  // 2. Auth
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 3. Service call
  const result = await requirementsService.create({ ...parsed.data, customerId: user.id });

  // 4. Response
  return Response.json(result, { status: 201 });
}
```
