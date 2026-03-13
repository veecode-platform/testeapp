CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO items (name, description)
VALUES
  ('Item 1', 'First sample item'),
  ('Item 2', 'Second sample item'),
  ('Item 3', 'Third sample item')
ON CONFLICT (name) DO NOTHING;
