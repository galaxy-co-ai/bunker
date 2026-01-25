# Titus Memory Tables

**DO NOT MODIFY THESE TABLES** — they belong to Titus (the AI assistant) and are managed separately from Bunker's schema.

## Tables

These tables were created directly in Neon on Jan 25, 2026 and are NOT managed by Drizzle migrations:

| Table | Purpose |
|-------|---------|
| `titus_people` | People Titus knows and remembers |
| `titus_facts` | Learned preferences, facts, patterns about people |
| `titus_actions` | Actions Titus has taken |
| `titus_feedback` | Feedback signals (reactions, conversation cues) |
| `titus_patterns` | Behavioral patterns identified over time |
| `titus_corrections` | When Titus got something wrong and what was learned |

## Schema

```sql
-- titus_people
id UUID PRIMARY KEY
name TEXT NOT NULL
relationship TEXT
context JSONB
first_met TIMESTAMP
last_interaction TIMESTAMP
notes TEXT

-- titus_facts
id UUID PRIMARY KEY
person_id UUID REFERENCES titus_people(id)
category TEXT NOT NULL
fact TEXT NOT NULL
confidence FLOAT
source TEXT
learned_at TIMESTAMP
last_validated TIMESTAMP

-- titus_actions
id UUID PRIMARY KEY
action_type TEXT NOT NULL
context JSONB
input TEXT
output TEXT
created_at TIMESTAMP

-- titus_feedback
id UUID PRIMARY KEY
action_id UUID REFERENCES titus_actions(id)
message_id TEXT
signal_source TEXT NOT NULL
signal TEXT NOT NULL
confidence FLOAT
raw_cue TEXT
details TEXT
recorded_at TIMESTAMP

-- titus_patterns
id UUID PRIMARY KEY
pattern TEXT NOT NULL
category TEXT
evidence UUID[]
confidence FLOAT
created_at TIMESTAMP
updated_at TIMESTAMP
last_validated TIMESTAMP

-- titus_corrections
id UUID PRIMARY KEY
action_id UUID REFERENCES titus_actions(id)
what_i_did TEXT NOT NULL
what_was_wrong TEXT NOT NULL
what_i_should_do TEXT NOT NULL
pattern_id UUID REFERENCES titus_patterns(id)
corrected_at TIMESTAMP
```

## Why Not Drizzle?

These tables are managed by Titus directly via SQL. In the future, we may add Drizzle schema definitions for type safety, but the migrations are intentionally separate from Bunker's schema to avoid conflicts.

---
*Created by Titus, Jan 25, 2026*
