# Anchor: Database Architecture
*Local-First Implementation Strategy utilizing WatermelonDB / SQLite.*

## Table: `anchors`
Represents the fixed, unmovable calendar blocks.
* `id`: string (uuid)
* `title`: string (e.g. "School", "Taco Bell Shift")
* `type`: enum (SCHOOL, WORK, PRACTICE, OTHER)
* `start_time`: time
* `end_time`: time
* `days_of_week`: array[int] (0-6)
* `is_active`: boolean
* `is_synced`: boolean (for cloud conflict resolution)

## Table: `tasks`
Fluid items dynamically arranged between anchor gaps. Supports micro-splitting via parent IDs.
* `id`: string (uuid)
* `title`: string
* `duration_minutes`: int
* `parent_task_id`: string (nullable, enables task splintering)
* `status`: enum (PENDING, COMPLETED, SKIPPED)
* `deadline`: timestamp
* `category`: enum (CHORE, HOMEWORK, HYGIENE, NUDGE)
* `completed_at`: timestamp (nullable)

## Table: `loadouts`
Reusable groupings of items tied to context.
* `id`: string (uuid)
* `anchor_reference_type`: string (e.g. "WORK")
* `name`: string
* `items`: json (Strict schema: Array of `{ id: uuid, name: string, isChecked: boolean, required: boolean }`)

## Table: `sleep_logs`
* `id`: string (uuid)
* `date`: string (YYYY-MM-DD)
* `target_bedtime`: timestamp
* `actual_bedtime`: timestamp (nullable)
* `wake_time`: timestamp (nullable)
* `debt_minutes`: int

## Table: `gamification_state`
Single-row table per user maintaining progressive statistics.
* `id`: string
* `user_id`: string
* `current_xp`: int
* `current_level`: int
* `streak_days`: int
* `last_streak_update`: timestamp
* `avatar_state`: enum (ENERGIZED, NORMAL, TIRED)
