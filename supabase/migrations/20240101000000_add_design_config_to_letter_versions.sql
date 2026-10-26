-- Add design_config column to letter_versions table
-- This stores the visual design configuration (theme, colors, border) per version

ALTER TABLE letter_versions
ADD COLUMN IF NOT EXISTS design_config jsonb DEFAULT NULL;
