CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}',
  due_date DATE,
  position DOUBLE PRECISION NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks" ON public.tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

INSERT INTO public.tasks (title, description, status, priority, tags, due_date, position) VALUES
('Logo idea visualizations from brainstorming session', 'Collect the three strongest marks and prepare them for review.', 'todo', 'high', ARRAY['Important','Visualization'], '2026-09-02', 1000),
('Generate proposed colours for initiating proposal', 'Two palettes: one warm, one high-contrast dark.', 'todo', 'medium', ARRAY['Conceptualization'], '2026-09-05', 2000),
('Make a budget proposal ASAP', 'Break down design, production and media spend.', 'todo', 'high', ARRAY['Finance','Budget'], '2026-08-28', 3000),
('Define brand tone and messaging guidelines', 'Voice, do/don''t examples and headline formulas.', 'inprogress', 'high', ARRAY['UI design'], '2026-08-30', 1000),
('Outline a marketing plan for the launch', 'Channels, phases and owner per phase.', 'inprogress', 'medium', ARRAY['Off track'], '2026-09-10', 2000),
('Coordinate with vendors for production materials', 'Confirm lead times before the print deadline.', 'inprogress', 'low', ARRAY['Visualization'], '2026-09-12', 3000),
('Draft a press release for the brand relaunch', 'Approved by comms, ready to schedule.', 'done', 'low', ARRAY['Visualization'], '2026-08-20', 1000),
('Set up the shared asset library', 'All logos, fonts and templates in one place.', 'done', 'medium', ARRAY['Important'], '2026-08-18', 2000);