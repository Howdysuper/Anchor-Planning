# Anchor: Onboarding Flow

*Goal Constraint: Must finish in under 3 minutes. Feels like establishing a game character build rather than a medical form or administrative task.*

## Screen 1: The Hook
* **Visual Presentation:** Deep OLED black (#0A0A0A). Central glowing Typography (`Inter-Bold`, 32px) fades upward with a 400ms duration sequence: "Let's fix the schedule."
* **Action:** Single Primary glowing button at the bottom of the safe area: `Start Setup` (Tap triggers haptic impact).

## Screen 2: The Core Anchor (School/Work)
* **Headline Text:** "What's the one thing you can't move?"
* **UI Construct:** A hyper-fluid, oversized time wheel picker taking up 50% of the screen for `Start Time` and `End Time`. Below it, a clean text input asking for the Event Name (e.g., "High School", "Target Shift").
* **Micro-Animation Feedback:** On confirm, the designated anchor block visually shoots downward, slotting into an empty daily timeline, proving visually that the app computes geometry and time.

## Screen 3: The Fuel (Sleep Setup)
* **Headline Text:** "How many hours of sleep feel like a superpower?"
* **UI Construct:** A custom, massive horizontal slider snapping only to integers (6, 7, 8, 9). 
* **State Change Visuals:** The slider track color interpolates based on value. Under 7 hours applies Orange (`#F7A06F`). 8 hours and above softly glows Green (`#6FF7A0`).
* **Real-Time Feedback:** Directly beneath the slider, dynamic text updates instantly: "To get 8 hours for [Anchor Name], your target bedtime tonight is [10:30 PM]."

## Screen 4: Character Manifest (Gamification Opt-in)
* **Visual Presentation:** A minimalist glowing elemental avatar (an orb or abstract shape) gently bobs in a center view via Reanimated. 
* **Input Field:** "Choose an alias." (Placeholder: e.g., 'NightOwl_99'). Small text beneath: "Only used for leaderboard parties. Never your real name."
* **Closing State:** The save action initiates a green flash. The text changes to "Your timeline is compiled." The screen transitions directly into the Home Dashboard with a 280ms spring sweep physics animation.
