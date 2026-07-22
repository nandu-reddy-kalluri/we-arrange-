# 🐴 We Arrange Engineering Mode — Powered by Ponytail

## Global Repository Rule

This repository permanently follows the **Ponytail Engineering Philosophy**.

Every implementation, refactor, bug fix, optimization, UI enhancement, and feature addition must follow these rules.

This is **not a one-time prompt**. Treat it as a permanent engineering standard for the repository.

---

# Core Philosophy

Think before you build.

The goal is **not to write less code**.

The goal is to write **only the code that is actually necessary.**

Always choose the simplest solution that is:

* Correct
* Maintainable
* Readable
* Production-ready
* Consistent with the existing architecture

If something can be removed instead of added, remove it.

If something can be reused instead of recreated, reuse it.

If something can be simplified, simplify it.

---

# Ponytail Decision Ladder

Before creating any file, component, hook, utility, or dependency, evaluate these questions in order.

### Step 1

Does this feature actually need to exist?

If not,

**Do not build it.**

---

### Step 2

Can an existing implementation solve this?

Search the repository.

Reuse before creating.

---

### Step 3

Can an existing component be extended?

Never duplicate components.

---

### Step 4

Can React, Next.js, TypeScript, HTML, CSS, or browser APIs solve this naturally?

Prefer native solutions.

---

### Step 5

Can an existing dependency already solve this?

Reuse installed packages.

Never introduce new dependencies unless there is a strong architectural reason.

---

### Step 6

Can this be implemented with fewer files?

Prefer fewer moving parts.

---

### Step 7

Only now write new code.

---

# Repository Rules

Always:

* Reuse components.
* Reuse hooks.
* Reuse utilities.
* Reuse layouts.
* Reuse typography.
* Reuse spacing.
* Reuse animations.
* Reuse design tokens.
* Reuse Tailwind utilities.

Never reinvent existing solutions.

---

# Simplicity Rules

Never create:

* Wrapper components used once.
* Hooks used once.
* Utility files with one function.
* Generic abstractions for hypothetical future needs.
* Configuration layers without clear value.
* Duplicate animations.
* Duplicate cards.
* Duplicate buttons.

Prefer composition over abstraction.

---

# Code Cleanup

Every commit should improve the repository.

Always remove:

* unused imports
* dead code
* obsolete components
* duplicate logic
* unnecessary state
* unnecessary effects
* unnecessary props
* unreachable code
* duplicated styles
* duplicated constants

Leave the repository cleaner than you found it.

---

# UI Rules

Maintain the existing We Arrange design system.

Never introduce inconsistent:

* spacing
* typography
* colors
* shadows
* radius
* animations
* transitions
* icons

Reuse existing UI patterns.

---

# Performance Rules

Always prefer:

* Server Components when appropriate
* Lazy loading only when beneficial
* Memoization only when measurable
* Native browser APIs
* Smaller bundles
* Faster rendering

Avoid premature optimization.

---

# Accessibility Rules

Never reduce:

* keyboard navigation
* focus visibility
* semantic HTML
* screen reader support
* ARIA attributes where required
* color contrast

Accessibility is never optional.

---

# TypeScript Rules

Avoid:

* any
* duplicated interfaces
* duplicated types
* unnecessary generics

Prefer:

* strict typing
* inferred types
* reusable interfaces

---

# Component Rules

Each component should have:

* one responsibility
* clear props
* predictable behavior
* minimal internal state

If a component becomes difficult to understand,

split it.

If two components are almost identical,

merge them.

---

# Refactoring Rules

Before implementing any feature:

1. Understand the existing architecture.
2. Identify duplicate code.
3. Remove unnecessary complexity.
4. Preserve existing behavior.
5. Improve readability.
6. Only then implement the requested feature.

---

# What Ponytail Never Sacrifices

Never trade simplicity for reduced quality.

Always preserve:

* Security
* Validation
* Error handling
* Accessibility
* Type safety
* Responsive design
* Performance
* User experience

---

# We Arrange Product Rules

This project is a premium wedding platform.

Every implementation must preserve:

* Luxury visual design
* Consistent design language
* Smooth animations
* Mobile-first responsiveness
* Performance
* Production quality

Do not introduce UI that feels inconsistent with the existing premium experience.

---

# Self-Review Before Finishing

Before considering any task complete, ask:

* Can I delete any code?
* Can I reuse an existing component?
* Can this be simpler?
* Can this use native HTML or CSS?
* Can I reduce files?
* Can I remove duplication?
* Is this consistent with the design system?
* Will another developer understand this immediately?

If the answer is **No**, improve the implementation before finishing.

---

# Golden Rule

> **Think like Ponytail. Build only what is necessary. Reuse everything possible. Remove everything unnecessary. Deliver clean, maintainable, production-ready code that enhances the We Arrange platform without increasing complexity.**
