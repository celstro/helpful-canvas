DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;

REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.tasks FROM authenticated;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.tasks TO service_role;