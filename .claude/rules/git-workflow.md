# YMWA Git Workflow Rules

This document governs naming, branching, and pull request policies for the YouMarriageWeArrange team.

---

## 1. Branch Naming Standard
Branches must follow this taxonomy:
- **Features:** `feature/YMWA-[task_id]-short-description`
- **Bug Fixes:** `bugfix/YMWA-[task_id]-short-description`
- **Refactoring:** `refactor/YMWA-[task_id]-short-description`

---

## 2. Commit Message Convention
Use standard semantic commits:
- `feat: add saved shortlists section`
- `fix: correct timezone hydration mismatch on date inputs`
- `style: align card shadows with design system tokens`
- `refactor: consolidate design tokens in theme.ts`

---

## 3. Pull Request Requirements
- Enforce strict PR reviews from at least one developer.
- Require running `npx tsc --noEmit` build compilation tests successfully before merges.
- Include a screenshot or brief recording for all UI-related changes.
