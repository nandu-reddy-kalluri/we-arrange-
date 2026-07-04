# ADR 001: Mobile-First Visual Guidelines

## Status
Accepted

## Context
Up to 90% of our target customers discover and share YouMarriageWeArrange flows via mobile viewports (e.g. WhatsApp, Instagram links). 

## Decision
- Every page, animation, interaction, and component structure must be fully designed, written, and tested on mobile screens first.
- Desktop is strictly an incremental enhancement layer.
- Components must use mobile-first styling conventions (Tailwind media classes prefix `md:`, `lg:` as overrides rather than desktop scales down).

## Implications
- Reduces page layout shifts on mobile loading.
- High accessibility on mobile screens.
- Forces developers to optimize spacing, typography, and assets sizes before building desktop views.
