# YMWA Rollback & Disaster Recovery Runbook

- **Target System:** YouMarriageWeArrange Production Platform
- **Date:** 2026-11-22
- **Lead SRE:** DevOps Engineer & Site Reliability Engineer
- **Document Scope:** Deployment Rollbacks, Database Point-In-Time Recovery, and Incident Response

---

## 1. Vercel Instant Deployment Rollback Protocol

If a production release exhibits unexpected runtime exceptions or degraded performance:

1. **Instant Rollback via Vercel Dashboard:**
   - Navigate to [Vercel Dashboard](https://vercel.com) ➔ Select the affected application (e.g. `ymwa-web`).
   - Go to the **Deployments** tab.
   - Locate the previous known-good deployment (e.g. commit `66ae1ae`).
   - Click the three dots `...` ➔ Select **Instant Rollback** (or **Promote to Production**).
   - *Time to recover:* < 30 seconds (Vercel updates the edge routing pointer immediately without re-compiling).

2. **Rollback via Vercel CLI (Headless SRE):**
   ```bash
   vercel rollback [deployment-url-or-id] --token=$VERCEL_TOKEN
   ```

---

## 2. Database Recovery & Migration Rollback Protocol

All Supabase migrations in `supabase/migrations/` are additive (`IF NOT EXISTS`, non-destructive column additions).

### 2.1 Reverting Migration 13 (Trigram & Numeric Pricing)
If numeric pricing filtering exhibits query plan degradation:
```sql
-- Step 1: Drop GIN trigram indexes
DROP INDEX IF EXISTS public.idx_venues_venue_name_trgm;
DROP INDEX IF EXISTS public.idx_venues_locality_name_trgm;
DROP INDEX IF EXISTS public.idx_venues_base_city_trgm;
DROP INDEX IF EXISTS public.idx_vendors_vendor_name_trgm;
DROP INDEX IF EXISTS public.idx_vendors_description_trgm;

-- Step 2: Drop B-tree price indexes
DROP INDEX IF EXISTS public.idx_venues_min_plate_price;
DROP INDEX IF EXISTS public.idx_venues_max_plate_price;

-- Step 3: (Optional) Drop columns if needed
ALTER TABLE public.venues DROP COLUMN IF EXISTS min_plate_price;
ALTER TABLE public.venues DROP COLUMN IF EXISTS max_plate_price;
```

### 2.2 Reverting Migration 06 (Foreign Key Indexes)
To drop specific covering indexes if maintenance overhead increases:
```sql
DROP INDEX IF EXISTS public.idx_venues_type_id;
DROP INDEX IF EXISTS public.idx_venues_area_id;
-- and any specific index as listed in 20261112170006_foreign_key_indexes.sql
```

### 2.3 Supabase Point-in-Time Recovery (PITR)
For critical database corruption or catastrophic data loss:
1. Navigate to Supabase Dashboard ➔ Project `zujjiiljvjwgcxtaqype` ➔ **Database** ➔ **Backups**.
2. Select **Point in Time Recovery (PITR)**.
3. Select the timestamp immediately preceding the incident.
4. Click **Start Recovery** to clone into a new restored database instance.

---

## 3. Incident Severity Levels & Response SLA

| Severity | Definition | Response SLA | Action Protocol |
|---|---|---|---|
| **SEV-1 (Critical)** | Core website down, payment outage, DB down | < 15 mins | Trigger Vercel instant rollback; verify Supabase health |
| **SEV-2 (High)** | Search degraded, images failing to load | < 1 hour | Verify Cloudflare cache rules; inspect `/api/health` |
| **SEV-3 (Medium)** | Isolated satellite portal bug, non-critical UI | < 4 hours | Hotfix via standard PR and CI deployment |
| **SEV-4 (Low)** | Minor copy error, cosmetic styling | < 24 hours | Standard release cycle |

---

## 4. Production Health Monitoring Checkpoints
- **Application Health:** Probe `https://www.youmarriagewearrange.com/api/health`
- **Expected Payload:**
  ```json
  {
    "status": "pass",
    "uptimeSeconds": 1420,
    "checks": {
      "database": {
        "status": "healthy",
        "latencyMs": 15
      }
    }
  }
  ```
- **Error Boundary APM:** Unhandled React runtime crashes are captured by `apps/web/app/global-error.tsx`.
