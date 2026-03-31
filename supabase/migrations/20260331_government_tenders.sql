CREATE TABLE IF NOT EXISTS government_tenders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  atm_id text,
  title text NOT NULL,
  agency text DEFAULT '',
  category_name text DEFAULT '',
  close_date timestamptz,
  atm_type text DEFAULT '',
  location text DEFAULT '',
  description_en text DEFAULT '',
  description_zh text DEFAULT '',
  link text DEFAULT '',
  guid text UNIQUE NOT NULL,
  is_construction boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tenders_construction ON government_tenders(is_construction);
CREATE INDEX idx_tenders_published ON government_tenders(published_at DESC);
