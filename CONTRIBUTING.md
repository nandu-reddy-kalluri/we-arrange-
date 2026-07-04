# Contributing to YouMarriageWeArrange

Thank you for contributing to YMWA. This guide covers everything you need to make a clean, reviewable contribution.

---

## Before You Start

1. Read the [Onboarding Guide](docs/onboarding/README.md) if you haven't already.
2. Check [`PROJECT_STATUS.md`](PROJECT_STATUS.md) to confirm your feature is in Phase 1 scope.
3. Check [`PROJECT_RULES.md`](PROJECT_RULES.md) and [`.claude/rules/anti-patterns.md`](.claude/rules/anti-patterns.md) to ensure your approach doesn't violate platform identity.

---

## Branch Naming

Follow the convention from [`.claude/rules/git-workflow.md`](.claude/rules/git-workflow.md):

```bash
feature/YMWA-[id]-short-description
bugfix/YMWA-[id]-short-description
refactor/YMWA-[id]-short-description
docs/YMWA-[id]-short-description
```

Examples:
```bash
feature/YMWA-42-requirements-form-validation
bugfix/YMWA-55-vendor-card-price-format
refactor/YMWA-61-extract-section-header
docs/YMWA-70-add-component-docs
```

---

## Commit Messages

Use semantic commit format:

```
feat: add Zod validation to requirements form
fix: correct price format in VendorCard from USD to lakhs
style: migrate VendorCard raw HSL values to design tokens
refactor: extract SectionHeader as shared component
docs: add QuoteCard planning document
test: add unit tests for formatDate utility
chore: update environment-variables.md with Phase 2 vars
```

---

## Pull Request Checklist

Before opening a PR, verify every item:

### Code Quality
- [ ] TypeScript compiles with zero errors: `node node_modules/typescript/bin/tsc --noEmit`
- [ ] Linter passes: `npm run lint`
- [ ] No `any` type used without an accompanying `// TODO:` comment
- [ ] No inline `bg-[#...]` or `text-[#...]` for colors that have design tokens

### Design System
- [ ] No new component named `*V2`, `*New`, `*Copy`, or `*Improved`
- [ ] Mobile layout reviewed at 375px before desktop layout
- [ ] All UI copy uses correct terminology from [`PROJECT_GLOSSARY.md`](PROJECT_GLOSSARY.md)
- [ ] No block elements (`div`, `h3`, `p`) nested inside `<button>` elements

### Business Model
- [ ] Feature does not automate what should be human-assisted (see [`.claude/rules/anti-patterns.md`](.claude/rules/anti-patterns.md))
- [ ] Feature is within Phase 1 scope (see [`PROJECT_STATUS.md`](PROJECT_STATUS.md))
- [ ] No sort-by-price, automated recommendations, or directory-style browse patterns added

### Documentation
- [ ] If a new shared component was added: a corresponding doc added to `docs/components/`
- [ ] If a major architectural decision was made: a new ADR added to `docs/decisions/`
- [ ] If an environment variable was added: it is documented in `.claude/rules/environment-variables.md`

### Submission
- [ ] PR description explains **what** changed and **why**
- [ ] Screenshots or recordings attached for all UI changes (mobile viewport required)
- [ ] PR is pointed at the correct base branch

---

## Review Process

- All PRs require at least **one reviewer approval** before merge.
- UI-related PRs require a mobile viewport screenshot as part of the PR description.
- Architecture changes require review from whoever is filling the Architecture Reviewer role.

---

## Questions?

- Product/domain questions → Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) and [`.claude/agents/concierge-domain-expert.md`](.claude/agents/concierge-domain-expert.md)
- Architecture questions → Read [`docs/architecture/system-diagram.md`](docs/architecture/system-diagram.md)
- Database questions → Read [`docs/database/schema.md`](docs/database/schema.md)
- Naming questions → Check [`PROJECT_GLOSSARY.md`](PROJECT_GLOSSARY.md) first
