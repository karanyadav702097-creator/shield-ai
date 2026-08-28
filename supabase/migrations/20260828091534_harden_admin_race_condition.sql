-- Harden first-admin assignment against a race condition.
-- The original trigger checked "does an admin already exist?" and inserted
-- 'admin' or 'user' accordingly. If two people signed up at almost the same
-- instant, both transactions could pass that check before either committed,
-- letting both become admin. A partial unique index makes "admin" effectively
-- a max-one-row role: the second concurrent insert now fails the uniqueness
-- constraint and is caught, falling back to a normal 'user' role instead.

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_admin_idx
  ON public.user_roles (role)
  WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      -- Someone else's concurrent signup won the race and became admin first.
      -- Fall through to the normal 'user' assignment below.
      NULL;
    END;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
