# Anchor: Gamification XP & Notification Logic

## Gamification Math Base
**Threshold Mapping:**
* Level 1: 0 XP
* Level 2: 100 XP
* Level 3: 250 XP
* Level 4: 500 XP
* Level 5: 1000 XP
* +500 XP per level sequentially thereafter.

**Level Calculation Logic (Backend Engine):**
```typescript
export function computeUserLevel(totalXp: number): number {
  if (totalXp < 100) return 1;
  if (totalXp < 250) return 2;
  if (totalXp < 500) return 3;
  if (totalXp < 1000) return 4;
  return Math.floor((totalXp - 1000) / 500) + 5;
}
```

**XP Gain Triggers:**
* `COMPLETE_LOADOUT_CHECK`: 15 XP
* `CONSUME_BREAKFAST`: 20 XP
* `HIT_SLEEP_TARGET`: 25 XP
* `COMPLETE_TASK_ON_TIME`: 10 XP

**Streak Multiplier:**
To incentivize consistency, a multiplier is applied to base XP. It accelerates slowly and caps out.
```typescript
const streakMultiplier = Math.min(1 + (activeStreakDays * 0.1), 2.5); // Fixed Cap at 2.5x
const awardedXP = Math.round(baseXP * streakMultiplier);
```

## Notification Logic & Pseudocode
Using `expo-notifications` for purely local, privacy-respecting scheduling.

```typescript
import * as Notifications from 'expo-notifications';
import { getEarliestAnchor } from '@/database/queries';

export async function computeAndScheduleDailyLogic(date: Date) {
  const anchors = await db.anchors.fetchActive(date);
  const userSleepGoalMins = await db.settings.getSleepGoal(); // e.g. 480 (8 hours)

  // 1. Wind Down Notification Formulation
  const firstAnchor = getEarliestAnchor(anchors);
  if (firstAnchor) {
    const wakeTime = subtractMinutes(firstAnchor.startTime, userSettings.morningBuffer);
    const targetBedTime = subtractMinutes(wakeTime, userSleepGoalMins);
    const windDownAlertTime = subtractMinutes(targetBedTime, 30);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Wind Down Sequence 🌙",
        body: "Phone down in 30 mins to hit your 8hr target before School tomorrow.",
        sound: 'gentle_chime.wav', // Adaptive tone
      },
      trigger: { date: windDownAlertTime },
    });
  }

  // 2. Loadout Memory Prompts
  for (const anchor of anchors) {
    if (anchor.hasLinkedLoadout) {
      const loadoutAlertTime = subtractMinutes(anchor.startTime, 15);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${anchor.name} is approaching`,
          body: "Last chance to check your Loadout. Do you have your wallet and keys?",
          sound: 'default',
        },
        trigger: { date: loadoutAlertTime }, // Context aware trigger
      });
    }
  }
}
```
