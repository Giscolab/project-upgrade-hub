
CREATE TABLE public.shader_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public access - shader presets are shared creative assets
ALTER TABLE public.shader_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shader presets"
  ON public.shader_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert shader presets"
  ON public.shader_presets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update shader presets"
  ON public.shader_presets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete shader presets"
  ON public.shader_presets FOR DELETE
  TO anon, authenticated
  USING (true);
