CREATE TABLE ad_channels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  leads_planned INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ad_channels (name, slug, sort_order) VALUES
  ('Авито', 'avito', 1),
  ('Профи.ру', 'profi', 2),
  ('Яндекс Директ', 'yandex_direct', 3),
  ('Яндекс Карты', 'yandex_maps', 4);