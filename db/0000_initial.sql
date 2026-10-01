CREATE TABLE workspace_meta (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL DEFAULT 0, owner_id TEXT NOT NULL);
CREATE TABLE task_state (id TEXT PRIMARY KEY, status TEXT NOT NULL, evidence TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '');
CREATE TABLE custom_tasks (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE principles (id TEXT PRIMARY KEY, content TEXT NOT NULL, scope TEXT NOT NULL, strength TEXT NOT NULL, source TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE events (id TEXT PRIMARY KEY, type TEXT NOT NULL, summary TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE TABLE runs (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL);
