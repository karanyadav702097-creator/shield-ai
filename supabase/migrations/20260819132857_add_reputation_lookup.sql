-- Reputation Lookup feature
-- Adds a normalized lookup_value/lookup_type to scam_reports so reports can be
-- searched by the phone number, UPI ID, or domain they relate to, and exposes
-- a SECURITY DEFINER function that returns only aggregated counts (never raw
-- report text/remarks) so anonymous visitors can safely query it without
-- being granted SELECT on the underlying table.

ALTER TABLE public.scam_reports
  ADD COLUMN IF NOT EXISTS lookup_type text,
  ADD COLUMN IF NOT EXISTS lookup_value text;

CREATE INDEX IF NOT EXISTS scam_reports_lookup_value_idx
  ON public.scam_reports (lookup_value)
  WHERE lookup_value IS NOT NULL;

CREATE OR REPLACE FUNCTION public.search_reputation(_lookup_value text)
RETURNS TABLE (
  total_reports integer,
  reports_last_30_days integer,
  verified_scam_count integer,
  top_category text,
  most_recent_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH matches AS (
    SELECT scam_category, status, created_at
    FROM public.scam_reports
    WHERE lower(lookup_value) = lower(_lookup_value)
  ),
  ranked_category AS (
    SELECT scam_category
    FROM matches
    GROUP BY scam_category
    ORDER BY count(*) DESC, max(created_at) DESC
    LIMIT 1
  )
  SELECT
    (SELECT count(*)::int FROM matches),
    (SELECT count(*)::int FROM matches WHERE created_at >= now() - interval '30 days'),
    (SELECT count(*)::int FROM matches WHERE status = 'Verified Scam'),
    (SELECT scam_category FROM ranked_category),
    (SELECT max(created_at) FROM matches);
$$;

-- Anonymous + logged-in users may call the lookup function, but this grant
-- does NOT give them SELECT on scam_reports itself — the function only ever
-- returns aggregated counts, never row contents.
REVOKE ALL ON FUNCTION public.search_reputation(text) FROM public;
GRANT EXECUTE ON FUNCTION public.search_reputation(text) TO anon, authenticated;
