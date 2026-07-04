# Component: RequirementsForm

**File:** `src/features/home/components/HeroSection.tsx` (embedded) → **`src/features/customer/components/RequirementsForm.tsx`** (Phase 1.5 extraction)
**Status:** Embedded in HeroSection (Phase 1) — to be extracted as standalone (Phase 1.5)

---

## Purpose

Captures the couple's wedding planning requirements. This is the **most important conversion component** in the entire platform — it is the trigger for the concierge workflow.

Every design, validation, and UX decision on this form must prioritise **completion rate** and **trust signalling**.

---

## Current Fields (Phase 1 — HeroSection embedded)

| Field | Type | Options | Required |
|:---|:---|:---|:---:|
| Location | `<select>` | Hyderabad areas (6 options) | No |
| Guest Size | `<select>` | Under 200, 200-500, 500-1000, 1000+ | No |
| Budget Limit | `<select>` | ₹10L-₹25L, ₹25L-₹50L, ₹50L-₹1Cr, ₹1Cr+ | No |

Phase 1 fields are non-required — the goal is low-friction form completion. Validation tightens in Phase 1.5.

---

## Planned Fields (Phase 1.5 — Standalone Component)

| Field | Type | Validation | Required |
|:---|:---|:---|:---:|
| Event Type | `<select>` | Must match `EVENT_TYPES` enum | ✅ |
| Event Date | `<input type="date">` | Must be at least 60 days from today | ✅ |
| Location Preference | `<select>` | Must match `HYDERABAD_AREAS` constant | ✅ |
| Guest Count Range | `<select>` | Must match `GUEST_RANGES` constant | ✅ |
| Budget Range | `<select>` | Must match `BUDGET_RANGES` constant | ✅ |
| Full Name | `<input type="text">` | Min 2 chars, max 60 chars | ✅ |
| Phone Number | `<input type="tel">` | India mobile format: 10 digits | ✅ |
| Additional Notes | `<textarea>` | Max 500 chars | No |

---

## Validation Rules

```typescript
// Zod schema (to be implemented in Phase 1.5)
const requirementsSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().refine((d) => {
    const date = new Date(d);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 60);
    return date >= minDate;
  }, "Event date must be at least 60 days from today"),
  locationPreference: z.enum(HYDERABAD_AREAS),
  guestCountRange: z.enum(GUEST_RANGES),
  budgetRange: z.enum(BUDGET_RANGES),
  fullName: z.string().min(2).max(60),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  additionalNotes: z.string().max(500).optional(),
});
```

---

## Do's ✅

- Add `suppressHydrationWarning` to all `<select>` and `<input>` elements
- Use `formatDate()` deterministic formatter for date display (never `toLocaleDateString()`)
- Show "Concierge Online" indicator near the submit button to signal human response
- Display expected turnaround time: "A specialist will contact you within 24–72 hours"
- Show real-time venue/vendor match count using `Counter` component (already in HeroSection)

## Don'ts ❌

- Do not show an "instant price estimate" after form completion — this contradicts the concierge model
- Do not add a "Find Venues Now" button that triggers automated search
- Do not mark all fields as required in Phase 1 — lower friction = higher completion rate
- Do not add free-text location input — only dropdown from pre-defined Hyderabad areas
- Do not add a "Sort by Price" or "Filter by Rating" option anywhere near this form

---

## Accessibility Requirements

- All `<select>` and `<input>` elements must have associated `<label>` elements
- Error messages must be announced by screen readers via `aria-describedby`
- Submit button must have `aria-busy="true"` during loading state
- Form must be completable using keyboard only

---

## Post-Submit Experience

After successful submission:
1. Show inline success message: "Your request has been received! A specialist will contact you within 24–72 hours."
2. Do NOT redirect immediately — let the couple read the confirmation in context
3. Persist the success state across page navigations (Phase 1.5 — use session storage)
