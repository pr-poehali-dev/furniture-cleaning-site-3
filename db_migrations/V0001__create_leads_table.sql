CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  comment TEXT,
  source TEXT NOT NULL DEFAULT 'form',
  furniture TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);