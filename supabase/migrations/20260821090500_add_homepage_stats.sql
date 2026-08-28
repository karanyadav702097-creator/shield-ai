-- Homepage live stats
-- scam_reports has RLS restricting SELECT to admins only, so the public
-- homepage can't query it directly. This SECURITY DEFINER function exposes
-- only aggregated counts (never row contents) so anonymous visitors can
-- safely see real, live numbers instead of hard-coded placeholder text.

CREATE OR REPLACE FUNCTION public.homepage_stats()
RETURNS TABLE (
  total_reports integer,
  high_risk_alerts_30d integer,
  threats_detected integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::int FROM public.scam_reports),
    (SELECT count(*)::int FROM public.scam_reports
       WHERE risk_level = 'High Risk' AND created_at >= now() - interval '30 days'),
    (SELECT coalesce(sum(coalesce(array_length(reasons, 1), 0)), 0)::int FROM public.scam_reports);
$$;

REVOKE ALL ON FUNCTION public.homepage_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.homepage_stats() TO anon, authenticated;
