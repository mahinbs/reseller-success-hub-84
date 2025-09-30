-- Create email_queue table and enqueue Day 1/3/7 emails on signup
-- This migration aligns with the deployed Edge Function `email-dispatcher`

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create email_queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes for the dispatcher
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled_at
  ON public.email_queue (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id
  ON public.email_queue (user_id);

-- Recreate handle_new_user to also enqueue Day 1/3/7 emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name text := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_first_name text := NULLIF(split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), '');
  v_email text := NEW.email;
  v_now timestamptz := now();
  v_html_day1 text;
  v_html_day3 text;
  v_html_day7 text;
BEGIN
  -- Create profile row
  INSERT INTO public.profiles (id, email, full_name, role, referral_name)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    'customer',
    NEW.raw_user_meta_data->>'referral_name'
  );

  -- Build beautiful HTML email templates
  v_html_day1 := '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BoostMySites BAAS</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2d3748; margin-bottom: 20px; }
    .main-text { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 20px; }
    .highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .highlight h2 { margin: 0 0 15px 0; font-size: 24px; font-weight: 700; }
    .highlight p { margin: 0; font-size: 16px; opacity: 0.9; }
    .cta-section { text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .contact-info { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .contact-info h3 { margin: 0 0 10px 0; color: #2d3748; font-size: 18px; }
    .contact-info p { margin: 5px 0; color: #4a5568; }
    .phone { font-weight: 600; color: #667eea; font-size: 18px; }
    .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to BoostMySites BAAS</h1>
      <p>Your business empire starts here</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ' || COALESCE(v_first_name, 'there') || '! 👋</div>
      
      <div class="main-text">
        Thank you for signing up at <strong>baas.boostmysites.com</strong>. We''re excited to help you simplify and scale your business with our Business-as-a-Service platform.
      </div>
      
      <div class="highlight">
        <h2>🎉 Exclusive 30% Discount</h2>
        <p>As a new member, you''re eligible for an exclusive discount on your subscription.<br>
        <strong>Valid only if you activate within your first 7 days!</strong></p>
      </div>
      
      <div class="main-text">
        Ready to transform your business? Here''s what you get with BoostMySites BAAS:
        <ul style="margin: 15px 0; padding-left: 20px;">
          <li>🔧 Complete business automation tools</li>
          <li>📈 Scalable infrastructure solutions</li>
          <li>💼 Professional service management</li>
          <li>🤝 Dedicated point of contact support</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3>📞 Claim Your Discount Now</h3>
        <p>Connect with your Point of Contact (PoC) or contact us directly:</p>
        <p class="phone">+91 821 778 4473</p>
        <p>Get your personalized coupon code and start saving today!</p>
      </div>
      
      <div class="cta-section">
        <p style="margin-bottom: 20px; color: #2d3748; font-weight: 600;">Start your business empire today and save big! 💰</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>– Team BoostMySites</strong></p>
      <p>Empowering businesses with intelligent automation</p>
    </div>
  </div>
</body>
</html>';

  v_html_day3 := '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Don''t Miss Your 30% Discount</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: #fce7ec; margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2d3748; margin-bottom: 20px; }
    .main-text { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 20px; }
    .urgency-box { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .urgency-box h2 { margin: 0 0 15px 0; font-size: 24px; font-weight: 700; }
    .urgency-box p { margin: 0; font-size: 16px; opacity: 0.9; }
    .timer { background-color: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; }
    .timer h3 { margin: 0 0 10px 0; color: #c53030; font-size: 18px; }
    .timer p { margin: 0; color: #2d3748; }
    .contact-info { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .phone { font-weight: 600; color: #f5576c; font-size: 18px; }
    .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Your Discount is Waiting</h1>
      <p>Don''t let this opportunity slip away</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ' || COALESCE(v_first_name, 'there') || '! 👋</div>
      
      <div class="main-text">
        It''s been a few days since you joined BoostMySites BAAS, and we wanted to remind you about something important...
      </div>
      
      <div class="urgency-box">
        <h2>🎯 Your 30% Discount is Still Available</h2>
        <p>But only if you subscribe within 7 days of signing up.<br>
        <strong>Time is running out!</strong></p>
      </div>
      
      <div class="timer">
        <h3>⚡ Quick Reminder</h3>
        <p>Your exclusive discount window is closing fast. Don''t miss out on substantial savings on your BoostMySites BAAS subscription.</p>
      </div>
      
      <div class="main-text">
        Here''s what you''re missing out on:
        <ul style="margin: 15px 0; padding-left: 20px;">
          <li>💰 30% off your first subscription</li>
          <li>🚀 Instant business automation setup</li>
          <li>📞 Dedicated support from day one</li>
          <li>🎯 Customized business solutions</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3>📞 Claim Your Coupon Code Now</h3>
        <p>Connect with your PoC or call us directly:</p>
        <p class="phone">+91 821 778 4473</p>
        <p><strong>Act now before it''s too late!</strong></p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>– Team BoostMySites</strong></p>
      <p>Your success is our priority</p>
    </div>
  </div>
</body>
</html>';

  v_html_day7 := '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Last Chance: 30% Discount Ends Today</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); padding: 40px 30px; text-align: center; border-top: 5px solid #e53e3e; }
    .header h1 { color: #c53030; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: #744210; margin: 10px 0 0 0; font-size: 16px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2d3748; margin-bottom: 20px; }
    .main-text { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 20px; }
    .final-warning { background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); border: 2px solid #fc8181; color: #c53030; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .final-warning h2 { margin: 0 0 15px 0; font-size: 24px; font-weight: 700; }
    .final-warning p { margin: 0; font-size: 16px; font-weight: 600; }
    .countdown { background-color: #fffaf0; border: 2px dashed #ed8936; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .countdown h3 { margin: 0 0 10px 0; color: #c05621; font-size: 20px; }
    .countdown p { margin: 0; color: #2d3748; font-weight: 600; }
    .contact-info { background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .contact-info h3 { margin: 0 0 15px 0; color: #1a202c; font-size: 20px; }
    .phone { font-weight: 700; color: #38a169; font-size: 20px; }
    .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 FINAL NOTICE</h1>
      <p>Your 30% discount expires TODAY</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ' || COALESCE(v_first_name, 'there') || ',</div>
      
      <div class="final-warning">
        <h2>⏰ LAST CHANCE</h2>
        <p>Your exclusive 30% discount expires at midnight today.<br>
        <strong>After this, the offer will no longer be available.</strong></p>
      </div>
      
      <div class="main-text">
        This is your final reminder. We don''t want you to miss out on this incredible opportunity to transform your business with BoostMySites BAAS at a discounted rate.
      </div>
      
      <div class="countdown">
        <h3>⏳ Time Running Out</h3>
        <p>Don''t let this opportunity pass you by.<br>
        <strong>Subscribe before midnight to secure your savings!</strong></p>
      </div>
      
      <div class="main-text">
        What you''ll get with BoostMySites BAAS:
        <ul style="margin: 15px 0; padding-left: 20px;">
          <li>🎯 Complete business automation at 30% off</li>
          <li>📈 Proven systems that scale with your growth</li>
          <li>🔧 Professional implementation support</li>
          <li>💪 Tools used by successful businesses</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3>📞 CALL NOW TO SECURE YOUR DISCOUNT</h3>
        <p>Connect with your PoC or call immediately:</p>
        <p class="phone">+91 821 778 4473</p>
        <p style="margin-top: 15px;"><strong>⚡ Get your coupon code before midnight!</strong></p>
      </div>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #1a202c; color: #ffffff; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #ffffff;">Don''t let this opportunity pass.</h3>
        <p style="margin: 0; font-size: 18px; font-weight: 600;">Subscribe today and grow with BoostMySites BAAS! 🚀</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>– Team BoostMySites</strong></p>
      <p>This is your final reminder - we believe in your success!</p>
    </div>
  </div>
</body>
</html>';

  -- Enqueue Day 1 (immediate), Day 3, Day 7 emails
  INSERT INTO public.email_queue (user_id, email, subject, html, scheduled_at, status, meta)
  VALUES
    (NEW.id, v_email, 'Welcome to BoostMySites BAAS – Claim 30% Off', v_html_day1, v_now, 'pending', jsonb_build_object('day', 1)),
    (NEW.id, v_email, 'Don’t Miss Your 30% Discount', v_html_day3, v_now + interval '3 days', 'pending', jsonb_build_object('day', 3)),
    (NEW.id, v_email, 'Last Chance: 30% Discount Ends Today', v_html_day7, v_now + interval '7 days', 'pending', jsonb_build_object('day', 7));

  RETURN NEW;
END;
$$;

-- Optional backfill: enqueue for users who exist but have no email_queue rows
INSERT INTO public.email_queue (user_id, email, subject, html, scheduled_at, status, meta)
SELECT
  u.id,
  u.email,
  x.subject,
  x.html,
  x.scheduled_at,
  'pending',
  x.meta
FROM auth.users u
LEFT JOIN LATERAL (
  SELECT
    'Welcome to BoostMySites BAAS – Claim 30% Off' AS subject,
    '<p>Hi ' || COALESCE(NULLIF(split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1), ''), 'there') || ',</p>' ||
    '<p>Thank you for signing up at baas.boostmysites.com. We’re excited to help you simplify and scale your business with our BAAS platform.</p>' ||
    '<p>As a new member, you’re eligible for an exclusive <strong>30% discount</strong> on your subscription. This offer is only valid if you activate within your first 7 days.</p>' ||
    '<p>To claim your discount, connect with your Point of Contact (PoC) or message <strong>+91 821 778 4473</strong> to claim your coupon code.</p>' ||
    '<p>Start your business empire today and save.</p>' ||
    '<p>– Team BoostMySites</p>' AS html,
    now() AS scheduled_at,
    jsonb_build_object('day', 1) AS meta
  UNION ALL
  SELECT
    'Don’t Miss Your 30% Discount',
    '<p>Hi ' || COALESCE(NULLIF(split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1), ''), 'there') || ',</p>' ||
    '<p>It’s been a few days since you joined BoostMySites BAAS. We wanted to remind you that your <strong>30% discount</strong> is still waiting for you, but only if you subscribe within 7 days of signing up.</p>' ||
    '<p>Claim your coupon code now by connecting with your PoC or calling <strong>+91 821 778 4473</strong>.</p>' ||
    '<p>Act soon. Your discount window is closing fast.</p>' ||
    '<p>– Team BoostMySites</p>' AS html,
    now() + interval '3 days' AS scheduled_at,
    jsonb_build_object('day', 3)
  UNION ALL
  SELECT
    'Last Chance: 30% Discount Ends Today',
    '<p>Hi ' || COALESCE(NULLIF(split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1), ''), 'there') || ',</p>' ||
    '<p>This is a final reminder for your <strong>30% discount</strong> which expires today. After this, the offer will no longer be available.</p>' ||
    '<p>To secure your savings, connect with your PoC or call <strong>+91 821 778 4473</strong> before midnight to get your coupon code.</p>' ||
    '<p>Don’t let this opportunity pass. Subscribe today and grow with BoostMySites BAAS.</p>' ||
    '<p>– Team BoostMySites</p>' AS html,
    now() + interval '7 days' AS scheduled_at,
    jsonb_build_object('day', 7)
) x ON TRUE
LEFT JOIN public.email_queue q ON q.user_id = u.id
WHERE q.user_id IS NULL;


