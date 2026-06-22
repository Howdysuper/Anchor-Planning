# Anchor: Feature Specification

## 1. Smart Scheduling Engine
* **Core Loop:** The system accepts "Anchor Points" (fixed scheduling blocks like School 08:00-15:00, Work 16:00-20:00). It acts as an inversion scheduler, placing fluid tasks (chores, studying, meals) strictly into the available gaps.
* **Bedtime Calculator:** Dynamically computes "Phone Down" time by deducting the user's sleep goal (e.g., 8 hours) plus wind-down buffer (30m) from tomorrow's earliest anchor point.
* **Reality Check:** If total task duration + anchors > 24 minus sleep goal, the engine flags an "Impossible Schedule" and proposes cuts based on priority levels.

## 2. Frictionless Capture System ("Brain Dump")
* **Input Layer:** Unified floating action button on the dashboard yielding a one-tap voice memo OR text field.
* **AI Categorization Loop:** Raw input -> Local NLP Processor -> Buckets: `Tasks`, `Items to Grab`, `People`, `Ideas`.
* **Context-Aware Prompting:** Links checklist items to geo-fences or anchor times (e.g., system prompts "wallet" 5 minutes before the Work anchor begins).
* **Loadouts:** Persistent reusable checklists tied to specific Anchor Points (e.g., "Marching Band Loadout", "Morning School Loadout").

## 3. Anti-Procrastination System
* **User-Authorized Blocks:** App blocks distracting apps during the focus gaps, strictly relying on user-set block permissions (iOS Screen Time API / Android UsageStatsManager) to ensure volition rather than penalty.
* **Burn-Down Timer:** Main task view shows remaining aggregate chore minutes total, demystifying the day's effort so tasks do not feel infinitely overwhelming.
* **Micro-Splitting:** User-assigned chores extending >20 minutes are automatically sliced into visually distinct 5-10 minute sprint chunks, auto-spread across free gaps.

## 4. Sleep Intelligence
* **Sleep Debt Battery:** Visual primary dashboard metaphor showing a sleep rolling sum compared to baseline target over the past 7 days.
* **Wind-Down Alerts:** Unambiguous 30-minute warning local push notification before the computed "Phone Down" time.
* **Morning Report:** Short, actionable toast upon waking (e.g., "Got 6.2h. 1h debt. Suggest taking a 20m nap at 3:15pm.").

## 5. Gamification & Gamified Habit Engine (Quest Log)
* **XP Tracking:** Routine actions grant fixed XP base values, heavily amplified by continuous streak multipliers.
* **Dynamic Avatars:** Tamagotchi-style buddy character providing visual reinforcement of overall streak health.
* **Social "Party Mode":** Friends group up into opt-in parties to perform shared weekly challenges (e.g. "5 breakfasts in a row") without sharing any private schedule coordinates.
