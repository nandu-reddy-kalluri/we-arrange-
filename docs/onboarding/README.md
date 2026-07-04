# YMWA — Onboarding Guide

Welcome to **YouMarriageWeArrange**. This guide is your ordered starting path.

Read these documents in this exact sequence before writing a single line of code.

---

## Step 1 — Understand the Product (30 minutes)

Read these files in order:

| Order | File | What You Learn |
|:---:|:---|:---|
| 1 | [`PROJECT_RULES.md`](../../PROJECT_RULES.md) | What YMWA is, what it is NOT, design philosophy |
| 2 | [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) | Business context, target audience, concierge model |
| 3 | [`PRODUCT_VISION.md`](../../PRODUCT_VISION.md) | Product roadmap and core value propositions |
| 4 | [`.claude/rules/business-model.md`](../../.claude/rules/business-model.md) | The concierge model feature evaluation checklist |
| 5 | [`PROJECT_GLOSSARY.md`](../../PROJECT_GLOSSARY.md) | Canonical terminology — read before naming anything |

---

## Step 2 — Understand the Design System (20 minutes)

| Order | File | What You Learn |
|:---:|:---|:---|
| 1 | [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) | Mobile-first rules, section-level layout specs |
| 2 | [`BRAND_GUIDELINES.md`](../../BRAND_GUIDELINES.md) | Colors, typography, micro-animation principles |
| 3 | [`.claude/rules/ui-ux-rules.md`](../../.claude/rules/ui-ux-rules.md) | Visual token rules, responsiveness constraints |
| 4 | [`.claude/rules/anti-patterns.md`](../../.claude/rules/anti-patterns.md) | What you must never build or style |

---

## Step 3 — Set Up Your Local Environment (follow `local-setup.md`)

See [`local-setup.md`](./local-setup.md) for the complete step-by-step environment setup.

---

## Step 4 — Understand the Architecture (20 minutes)

| Order | File | What You Learn |
|:---:|:---|:---|
| 1 | [`docs/architecture/system-diagram.md`](../architecture/system-diagram.md) | Platform layer diagram |
| 2 | [`.claude/rules/coding-standards.md`](../../.claude/rules/coding-standards.md) | Directory structure, naming conventions |
| 3 | [`.claude/rules/environment-variables.md`](../../.claude/rules/environment-variables.md) | Every env var, where it lives, what it does |
| 4 | [`CLAUDE.md`](../../CLAUDE.md) | CLI commands, hydration rules, animation standards |

---

## Step 5 — Review Architectural Decisions

Scan the decision records to understand *why* key choices were made:

```
docs/decisions/
  001-mobile-first.md
  002-hyderabad-only-mvp.md
  003-concierge-business-model.md
  004-homepage-storytelling.md
  019-mobile-first-enforcement.md
  020-concierge-first-navigation.md
  021-human-assisted-quote-collection.md
  022-no-ai-features-phase-1.md
```

---

## Step 6 — Understand Your Role

Read the agent profile that matches your role:

| Role | File |
|:---|:---|
| Frontend Engineer | [`.claude/agents/frontend-engineer.md`](../../.claude/agents/frontend-engineer.md) |
| Backend Engineer | [`.claude/agents/backend-engineer.md`](../../.claude/agents/backend-engineer.md) |
| UI Designer | [`.claude/agents/ui-designer.md`](../../.claude/agents/ui-designer.md) |
| Architecture Review | [`.claude/agents/architecture-reviewer.md`](../../.claude/agents/architecture-reviewer.md) |
| QA | [`.claude/agents/qa-reviewer.md`](../../.claude/agents/qa-reviewer.md) |
| Domain Questions | [`.claude/agents/concierge-domain-expert.md`](../../.claude/agents/concierge-domain-expert.md) |

---

## Step 7 — First Contribution Checklist

Before submitting your first PR, verify:

- [ ] Local dev server runs without errors (`npm run dev`)
- [ ] TypeScript compiles with zero errors (`node node_modules/typescript/bin/tsc --noEmit`)
- [ ] No new `bg-[#...]` inline color values added (use design tokens)
- [ ] No new component named `*V2`, `*New`, or `*Improved`
- [ ] All UI text uses correct terminology from `PROJECT_GLOSSARY.md`
- [ ] Mobile layout reviewed before desktop layout
- [ ] No block elements nested inside `<button>` elements
- [ ] Git branch named following convention in `.claude/rules/git-workflow.md`

---

## Project Status

Check [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md) for the current development phase and what is in-scope vs out-of-scope before starting any feature work.
