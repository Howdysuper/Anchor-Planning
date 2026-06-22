# Anchor: Code & Component Architecture (React Native)

## 1. Core Stack
* **Framework:** React Native + Expo (Managed Workflow, utilizing Expo Router with file-based routing architecture).
* **State Management:** Zustand (Ideal for transient UI state, gamification XP triggers, and synchronicity).
* **Database Target:** WatermelonDB (Reactive SQLite wrapper to ensure 60fps local-first data rendering without bridge-blocking latency).
* **Styling Implementation:** Component-level StyleSheet objects deriving exact token values from a centralized Theme provider. (Strictly no generic UI libraries like NativeBase or Paper; handcrafted views required to enforce OLED constraints).
* **Animations:** React Native Reanimated v3 + React Native Gesture Handler.

## 2. Directory Structure
```
/src
  /assets
    /fonts
      Inter-Regular.ttf
      Inter-Medium.ttf
      Inter-Bold.ttf
    /lottie       (For XP bursts and avatar states)
  /components
    /core
      AnchorButton.tsx    (Implements 14px radius, 52px height)
      AnchorCard.tsx      (20px radius, 1px solid border)
      Typography.tsx      (Standardized Inter styles)
    /forms
      SemanticInput.tsx   (Minimum 52px height, valid on blur)
    /complex
      TimelineSlider.tsx  (For horizontal Anchor blocks)
      SleepBattery.tsx
      QuestCard.tsx
  /screens
    (Dashboard, Loadouts, SleepIntel, QuestLog, Setup)
  /database
    (Watermelon schemas, synchronization queues)
  /theme
    (tokens.ts - the definitive single source of truth for all Hex values)
  /services
    (AIProcessor, NotificationScheduler, GamificationEngine)
  /store
    (useGamificationStore, useScheduleStore)
```

## 3. Strict UI Constraints
* **Gesture Conflict Avoidance:** Horizontal gesture elements (e.g. Anchor slider) are strictly bounded to their container areas.
* **Safe Areas:** `<SafeAreaView>` standard; dynamic margins applied for devices with the Dynamic Island.
* **Text Accessibility:** React Native `allowFontScaling={true}` explicitly supported; layouts utilize flexbox wrappers to prevent clipping if the user scales system fonts.
* **Color Usage:** All color applications must import from `TOKENS` object—raw hex codes in component files result in PR rejections.
