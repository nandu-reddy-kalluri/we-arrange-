# GEMINI.md — Gemini Agent Guidelines

This document guides Gemini-based developers and pairing assistants in contributing to **YouMarriageWeArrange**.

---

## 1. Context Checking (Mandatory Step)
- **Check KIs First:** Read Knowledge Items (`metadata.json` and artifacts) before initializing refactoring or proposing new features.
- **Review System Status:** Always read `PROJECT_STATUS.md` and `PROJECT_RULES.md` to ensure your suggestions fit within current MVP boundaries.

## 2. Directory Architecture Priorities
- Never place route groups or layouts without confirming the layout hierarchy of `src/app/layout.tsx`.
- Place domain services under `src/services/` or local `features/*/services/` folders. Direct backend integration calls should never leak into component code.

## 3. Pairing Etiquette
- Use markdown artifacts for reports, tables, design flows, and diagrams (Mermaid format).
- Provide concise, non-redundant, and structured answers. Do not duplicate summaries of updated artifacts in chat responses.
