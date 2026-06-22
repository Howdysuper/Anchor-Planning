# Anchor: UI/UX Screen Architecture

*Design System Note: All screens strictly utilize OLED Black (`#0A0A0A`) backgrounds, 8pt layouts, semantic color tokens, and Lucide React Native sizing minimums (44pt touch).*

## 1. Home Dashboard (The "Command Center")
* **Header:** Subtle greeting, current date, small streak flame icon top right.
* **Anchor Timeline (Horizontal):** A smooth horizontal scroll view mapping today's anchors visually like calendar blocks. Current block is highlighted in primary Purple (`#7C6FF7`).
* **Sleep Battery:** A horizontal battery-segmented visual filling up with Purple. Depleted segments show muted Surface2 backgrounds with Error (`#F76F6F`) deficit text.
* **Active Quest (Upcoming Task):** Surface2 (`#1E1E1E`) elevated bordered card, showing the next 10-minute micro-task or meal nudge (Orange). Swipe right gesture to mark complete.
* **FAB:** Bottom right, glowing primary button with a Plus icon triggering the "Brain Dump". Micro-animation scale down on press.

## 2. Anchor Setup (Schedule Builder)
* **Layout:** Vertical list view of the week. Swipeable days at the top. Primary CTA "Add Anchor".
* **Interaction:** Tapping a day brings up a bottom sheet modal (rounded top corners 24px).
* **Inputs:** Oversized, tap-friendly iOS-style scrollers for Start Time and End Time. 
* **Calc Visual:** A sticky top bar updating in real-time, displaying remaining "Free Hours" as you adjust anchor times.

## 3. Loadout Screen (Pocket Checklist)
* **View:** Grid layout of loadout situations (e.g., "School Day", "Work Shift", "Rehearsal").
* **Active Status:** When an anchor is approaching in <1hr, its respective loadout card elevates (0 8px 32px rgba(0,0,0,0.6)) and pulses softly with Accent Green (`#6FF7A0`).
* **Checklist Modal:** Opens into a full-screen vertical list. Items require a robust swipe-to-complete (reduces accidental quick clicks and forces mindfulness).

## 4. Sleep Intel
* **Chart:** A bar chart of the past 7 days utilizing accented colors if goals were met (Primary Purple) or missed (Error Red). Tabular figures used for data text.
* **Card Insights:** "Tonight's Target: 10:30 PM", "Optimal Wake: 6:30 AM" presented as large, readable data cards. 

## 5. Brain Dump (Inbox)
* **Input State:** A massive, center-screen text input pushing the keyboard up immediately upon entering the view. Next to it, a microphone, generating a soft ripple when active.
* **Categorization Output:** Tapping "Save" triggers a 200ms spring transition; four animated pill-buckets appear where the AI visually "drops" the parsed thought into the correct category (e.g., "Tasks", "Items to Grab").
