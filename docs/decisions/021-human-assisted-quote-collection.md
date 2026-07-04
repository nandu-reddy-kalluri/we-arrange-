# ADR 021: Human-Assisted Quote Collection Only

## Status
Accepted

## Context
The most natural engineering instinct when building a quote system is to automate it: scrape venue pricing from their websites, use an API to pull standard rates, or calculate estimated costs from historical data. This would be technically faster and appear to deliver the same output to users.

However, automated quote collection fundamentally breaks the YMWA business model for three reasons:

1. **Accuracy:** Wedding venue pricing in Hyderabad is highly negotiable and package-dependent. Published rates are often stale or unrepresentative of actual negotiated packages.
2. **Trust:** The core YMWA value proposition is that a specialist personally called and negotiated a package for this specific couple. Automated scraping cannot replicate this.
3. **Differentiation:** If quotes are automated, YMWA becomes indistinguishable from JustDial, WedMeGood, or WeddingWire — the exact competitors it is designed to outcompete.

## Decision
All quote data stored in the `quotes` table must originate from human specialist action:

- Every quote record must have a `collected_by` field referencing a YMWA team member's user ID.
- No automated scraping pipeline, crawler, or API integration may write to the `quotes` table.
- No quote may be marked `status: quotes_collected` without a specialist explicitly confirming it in the admin portal.
- Quote pricing is always entered manually by the specialist from directly communicated venue/vendor figures.

## What Is Permitted (Automation That Supports Humans)
- Automated notifications to the specialist when a new requirement is submitted
- Automated status update emails to the couple when their comparison sheet is ready
- Auto-formatting templates that the specialist fills in (not auto-fills)
- Calendar reminders for follow-up calls

## Implications
- Requires a functional admin portal where specialists can log and assemble quotes
- Turnaround time is 24–72 hours (must be communicated to users as expectation-setting)
- Scales with the team, not with the database — hiring more specialists = handling more requirements
- All AI-assisted features in the admin portal are limited to templates and formatting aids only
