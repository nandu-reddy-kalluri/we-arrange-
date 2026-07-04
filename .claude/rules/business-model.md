# YMWA Business Model Rules

> [!IMPORTANT]
> Read this document before proposing any new feature, endpoint, UI flow, or data model change.
> Every decision in this project must be evaluated against this model first.

---

## What YouMarriageWeArrange Is

YouMarriageWeArrange is a **human-assisted Wedding Concierge Platform**.

The business model is:

```
Couple submits wedding requirements
        ↓
YMWA Concierge Specialist contacts venues and vendors directly
        ↓
Specialist collects, negotiates, and assembles multiple quotations
        ↓
Couple receives a clean, side-by-side comparison sheet
        ↓
Couple selects the best match with confidence
```

This model is the **entire product**. Every feature, page, button, and API endpoint must serve this flow.

---

## What YouMarriageWeArrange Is NOT

| It is NOT | Because |
|:---|:---|
| A venue directory | Directories list everything. YMWA lists only concierge-vetted, personally contacted partners. |
| A self-service marketplace | Vendors do not self-register. Listings are curated by the admin team. |
| A price comparison aggregator | Price is context, not a ranking dimension. Quotes are negotiated, not scraped. |
| A SaaS subscription tool | There are no subscription tiers, feature gates, or freemium models. |
| An AI recommendation engine | No automated ranking, filtering by ML model, or AI-generated suggestions. |
| A generic wedding template site | Every design decision reflects luxury hospitality, not a generic wedding theme. |

---

## The Three Pillars That Must Never Be Compromised

### 1. Human Assistance
Every user interaction must eventually connect to a human YMWA specialist.
- ❌ Never build: "Get instant automated quotes"
- ✅ Always build: "Submit your requirements → A specialist will contact you"

### 2. Decision Confidence
The platform's job is to make the couple feel informed, not overwhelmed.
- ❌ Never build: Infinite scrolling venue lists with no curation
- ✅ Always build: Curated, shortlisted, side-by-side comparisons

### 3. Trust Signaling
Every section must answer at least one of these questions for the user:
- *Why should I trust YMWA?*
- *How does this process work?*
- *What happens after I submit?*
- *Who is helping me?*

---

## Feature Evaluation Checklist

Before implementing any new feature, answer these questions:

```
1. Does this feature require human specialist involvement?
   YES → Proceed with design.
   NO  → Flag for review. It may be automating what should be human.

2. Does this feature help the couple make a confident decision?
   YES → Proceed.
   NO  → Reconsider scope.

3. Does this feature make YMWA look like a directory or marketplace?
   NO  → Proceed.
   YES → STOP. Redesign the feature.

4. Does this feature respect the Hyderabad MVP boundary?
   YES → Proceed.
   NO  → Flag as Phase 2+ scope.

5. Is the copy language that of a concierge, not an algorithm?
   YES → Proceed.
   NO  → Rewrite copy before implementing.
```

---

## Optimization Priorities (in order)

Always optimize in this order. Never invert this hierarchy.

1. **Human assistance quality** — Does this help the specialist serve the couple better?
2. **Decision confidence** — Does this make the couple's choice clearer?
3. **Comparison quality** — Is the information presented in a clean, comparable format?
4. **Trust signals** — Does this increase perceived credibility and reliability?
5. **Performance** — Is this fast enough on a mid-range Android device on 4G?
6. **Automation** — Automation is last, and only if it does not reduce human touch.

---

## Never Optimize For

- Directory browsing velocity (how fast users can scan many listings)
- Automated ranking (algorithmic sort order)
- Lowest-price-first presentation
- Vendor self-priority or promoted placement
- Session duration (do not add features to keep users on the site longer; add features to help them decide faster)
