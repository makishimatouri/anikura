ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS header_image_url text;

COMMENT ON COLUMN public.events.header_image_url IS
  'Optional horizontal header image for event cards and homepage carousel. Recommended aspect ratio: 16:9 or 21:9. Falls back to poster_url when empty.';
