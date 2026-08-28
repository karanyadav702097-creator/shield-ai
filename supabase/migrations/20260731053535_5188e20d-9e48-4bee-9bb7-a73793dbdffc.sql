CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text,
  input_url text,
  scam_category text NOT NULL DEFAULT 'Other',
  risk_score int NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'Low Risk',
  reasons text[] NOT NULL DEFAULT '{}',
  user_remark text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.scam_reports TO anon;
GRANT SELECT, INSERT, UPDATE ON public.scam_reports TO authenticated;
GRANT ALL ON public.scam_reports TO service_role;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a scam report" ON public.scam_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view scam reports" ON public.scam_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update scam reports" ON public.scam_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.scam_reports (input_text, input_url, scam_category, risk_score, risk_level, reasons, user_remark, status, created_at) VALUES
('Your bank account will be blocked today. Click this link immediately to update KYC.', 'http://sbi-kyc-update.xyz/verify', 'Fake Bank/KYC Scam', 92, 'High Risk', ARRAY['Contains urgent language','Mentions account blocking','Mentions KYC / banking keywords','Contains a link'], 'Received on SMS from unknown number', 'Verified Scam', now() - interval '2 hours'),
('Congratulations! You have won a cash prize of Rs 25,00,000. Share your OTP to claim.', NULL, 'Fake Lottery/Reward Scam', 88, 'High Risk', ARRAY['Reward / lottery wording detected','Requests sensitive data (OTP/PIN/CVV)','Contains urgent language'], 'WhatsApp forward', 'Verified Scam', now() - interval '9 hours'),
(NULL, 'http://192.168.44.10/paytm-login-update', 'Phishing Link', 80, 'High Risk', ARRAY['Missing HTTPS','Uses an IP address instead of a domain','Imitates a known brand/bank name','Contains scam keywords'], 'Link came in an email', 'Under Review', now() - interval '1 day'),
('Work from home job selected! Pay registration fee of 1200 to confirm your internship.', NULL, 'Fake Job/Internship Scam', 65, 'Medium Risk', ARRAY['Fake job / internship wording detected','Requests a payment'], 'Telegram message', 'Pending', now() - interval '2 days'),
(NULL, 'https://bit.ly/3xReward', 'Phishing Link', 45, 'Medium Risk', ARRAY['Uses a URL shortener','Contains scam keywords'], NULL, 'Pending', now() - interval '3 days'),
('Your parcel is on hold, kindly confirm your delivery address.', NULL, 'Delivery/Courier Scam', 28, 'Low Risk', ARRAY['Courier / delivery wording detected'], 'Might be genuine', 'False Report', now() - interval '5 days');