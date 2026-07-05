CREATE TABLE IF NOT EXISTS community_messages (
  id BIGSERIAL PRIMARY KEY,
  seed_key TEXT UNIQUE,
  author_name VARCHAR(48) NOT NULL CHECK (char_length(btrim(author_name)) BETWEEN 1 AND 48),
  content TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 500),
  visitor_hash TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_visible_created
  ON community_messages (created_at DESC)
  WHERE status = 'visible';

CREATE INDEX IF NOT EXISTS idx_community_messages_visitor_created
  ON community_messages (visitor_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS site_visitors (
  visitor_hash TEXT PRIMARY KEY,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_ip_hash TEXT,
  last_ip_hash TEXT,
  user_agent_hash TEXT
);

CREATE TABLE IF NOT EXISTS site_visit_events (
  id BIGSERIAL PRIMARY KEY,
  visitor_hash TEXT NOT NULL REFERENCES site_visitors(visitor_hash) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  lang VARCHAR(16) NOT NULL DEFAULT 'unknown',
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (visitor_hash, window_start, path)
);

CREATE INDEX IF NOT EXISTS idx_site_visit_events_created
  ON site_visit_events (created_at DESC);

CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_stats (key, value)
VALUES ('total_visits', 0), ('total_unique_visitors', 0)
ON CONFLICT (key) DO NOTHING;
