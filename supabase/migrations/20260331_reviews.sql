CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id uuid NOT NULL,
  reviewer_name text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('professional', 'supplier')),
  entity_id uuid NOT NULL,
  entity_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  project_type text,
  suburb text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
