# ADR 022: No AI-Generated Features in Phase 1

## Status
Accepted

## Context
AI-generated features (recommendation engines, price prediction, smart matching, automated content generation) are technically straightforward to add given the current stack. Several such features would appear to improve the product surface — for example, an AI that recommends venues based on requirement similarity, or a chatbot that answers venue questions.

However, introducing AI-generated features during Phase 1 poses three critical risks:

1. **Model integrity risk:** If YMWA presents AI recommendations, users will perceive the service as algorithmic, not concierge. This fundamentally changes the trust relationship and marketing position.

2. **Accuracy risk:** AI models do not have access to real-time Hyderabad venue availability, current pricing, or negotiated package details. AI-generated estimates would frequently be incorrect, damaging trust.

3. **Scope risk:** AI features require significant infrastructure (model hosting, vector databases, prompt engineering, hallucination testing). Phase 1 must ship the concierge MVP — not an AI product.

## Decision
No AI-generated features may be implemented in Phase 1. This includes:

- ❌ AI-powered venue recommendations
- ❌ Smart matching algorithms
- ❌ Automated chatbots or virtual assistants representing YMWA
- ❌ AI-generated price estimates or budget predictions
- ❌ ML-based ranking or sorting of venues or vendors
- ❌ Automated quote summarisation (Phase 1 quotes are always read directly from specialist notes)
- ❌ AI-written content on any customer-facing page

## What Is Permitted in Phase 1
- ✅ Search/filter UI powered by simple database queries
- ✅ Static, manually curated venue and vendor selections
- ✅ Human-written copy and descriptions
- ✅ Development tooling use of AI (Cursor, Copilot, Claude, Gemini) for writing code — not for generating product content

## Review Gate for Phase 2
AI features may be re-evaluated for Phase 2+ under these conditions:
- The human concierge model is fully operational and revenue-generating
- A dataset of real quotes and requirements exists to train or fine-tune models
- All AI-generated content is clearly labelled as AI-assisted
- A human specialist reviews all AI outputs before they reach the customer

## Implications
- Keeps Phase 1 scope focused and deliverable
- Prevents "feature creep from demos" — AI demos are impressive but distract from shipping the core product
- Preserves the trust positioning that differentiates YMWA from algorithmic competitors
