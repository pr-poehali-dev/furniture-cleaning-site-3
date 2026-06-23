ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';

UPDATE services SET category = 'sofas' WHERE name ILIKE '%диван%';
UPDATE services SET category = 'mattresses' WHERE name ILIKE '%матрас%';
UPDATE services SET category = 'additional' WHERE name ILIKE '%запах%' OR name ILIKE '%пятн%' OR name ILIKE '%дезинфекц%';
UPDATE services SET category = 'other' WHERE category = 'other' AND name NOT ILIKE '%диван%' AND name NOT ILIKE '%матрас%';