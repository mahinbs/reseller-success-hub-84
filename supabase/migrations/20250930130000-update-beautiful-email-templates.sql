-- Update handle_new_user function with beautiful HTML email templates
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

  -- Build beautiful HTML email templates with company branding
  v_html_day1 := '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BoostMySites BAAS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
    }
    .email-container::before {
      content: '''';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '''';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .logo-container {
      background: rgba(255,255,255,0.95);
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      display: inline-block;
      margin-bottom: 20px;
    }
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .logo img {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: contain;
    }
    .company-tagline {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
      font-weight: 500;
    }
    .header h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 1px;
    }
    .header p {
      font-size: 18px;
      opacity: 0.9;
    }
    .content { padding: 40px; }
    .greeting { 
      font-size: 20px; 
      color: #2d3748; 
      margin-bottom: 25px; 
      font-weight: 600;
    }
    .main-text { 
      font-size: 16px; 
      line-height: 1.7; 
      color: #4a5568; 
      margin-bottom: 25px; 
    }
    .highlight { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: #ffffff; 
      padding: 30px; 
      border-radius: 16px; 
      text-align: center; 
      margin: 30px 0;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    .highlight h2 { 
      margin: 0 0 15px 0; 
      font-size: 26px; 
      font-weight: 700; 
    }
    .highlight p { 
      margin: 0; 
      font-size: 16px; 
      opacity: 0.95; 
    }
    .features-list {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #667eea;
    }
    .features-list ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .features-list li {
      margin: 10px 0;
      font-size: 15px;
      color: #374151;
    }
    .contact-info { 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 25px; 
      border-radius: 12px; 
      margin: 25px 0;
      border: 1px solid #0ea5e9;
    }
    .contact-info h3 { 
      margin: 0 0 15px 0; 
      color: #0369a1; 
      font-size: 18px; 
      font-weight: 700;
    }
    .contact-info p { 
      margin: 8px 0; 
      color: #0c4a6e; 
    }
    .phone { 
      font-weight: 700; 
      color: #0369a1; 
      font-size: 20px; 
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      display: inline-block;
      margin: 10px 0;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
      padding: 25px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      border: 1px solid #f59e0b;
    }
    .cta-section p {
      font-size: 18px;
      font-weight: 700;
      color: #92400e;
      margin: 0;
    }
    .footer { 
      background: #1f2937; 
      color: #9ca3af; 
      padding: 30px; 
      text-align: center; 
      font-size: 14px;
    }
    .footer p { margin: 5px 0; }
    .footer strong { color: #f3f4f6; }
    @media (max-width: 768px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 28px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo">
            <img src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png" alt="BoostMySites Logo">
            <div class="company-tagline">AI-Powered Digital Solutions</div>
          </div>
        </div>
        <h1>🚀 Welcome to BoostMySites BAAS</h1>
        <p>Your business empire starts here</p>
      </div>
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
      
      <div class="features-list">
        <strong style="color: #1f2937; font-size: 16px;">Ready to transform your business? Here''s what you get with BoostMySites BAAS:</strong>
        <ul>
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
        <p>Start your business empire today and save big! 💰</p>
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
    }
    .email-container::before {
      content: '''';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #f093fb, #f5576c, #ff9a9e);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '''';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .logo-container {
      background: rgba(255,255,255,0.95);
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      display: inline-block;
      margin-bottom: 20px;
    }
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .logo img {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: contain;
    }
    .company-tagline {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
      font-weight: 500;
    }
    .header h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 1px;
    }
    .header p {
      font-size: 18px;
      opacity: 0.9;
    }
    .content { padding: 40px; }
    .greeting { 
      font-size: 20px; 
      color: #2d3748; 
      margin-bottom: 25px; 
      font-weight: 600;
    }
    .main-text { 
      font-size: 16px; 
      line-height: 1.7; 
      color: #4a5568; 
      margin-bottom: 25px; 
    }
    .urgency-box { 
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
      color: #ffffff; 
      padding: 30px; 
      border-radius: 16px; 
      text-align: center; 
      margin: 30px 0;
      box-shadow: 0 10px 25px rgba(240, 147, 251, 0.3);
    }
    .urgency-box h2 { 
      margin: 0 0 15px 0; 
      font-size: 26px; 
      font-weight: 700; 
    }
    .urgency-box p { 
      margin: 0; 
      font-size: 16px; 
      opacity: 0.95; 
    }
    .timer { 
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-left: 4px solid #f56565; 
      padding: 25px; 
      margin: 25px 0;
      border-radius: 12px;
    }
    .timer h3 { 
      margin: 0 0 15px 0; 
      color: #c53030; 
      font-size: 18px; 
      font-weight: 700;
    }
    .timer p { 
      margin: 0; 
      color: #2d3748; 
      font-size: 15px;
    }
    .features-list {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #f5576c;
    }
    .features-list ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .features-list li {
      margin: 10px 0;
      font-size: 15px;
      color: #374151;
    }
    .contact-info { 
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 25px; 
      border-radius: 12px; 
      margin: 25px 0;
      text-align: center;
      border: 1px solid #f56565;
    }
    .contact-info h3 { 
      margin: 0 0 15px 0; 
      color: #c53030; 
      font-size: 18px; 
      font-weight: 700;
    }
    .contact-info p { 
      margin: 8px 0; 
      color: #2d3748; 
    }
    .phone { 
      font-weight: 700; 
      color: #c53030; 
      font-size: 20px; 
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      display: inline-block;
      margin: 10px 0;
    }
    .footer { 
      background: #1f2937; 
      color: #9ca3af; 
      padding: 30px; 
      text-align: center; 
      font-size: 14px;
    }
    .footer p { margin: 5px 0; }
    .footer strong { color: #f3f4f6; }
    @media (max-width: 768px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 28px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo">
            <img src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png" alt="BoostMySites Logo">
            <div class="company-tagline">AI-Powered Digital Solutions</div>
          </div>
        </div>
        <h1>⏰ Your Discount is Waiting</h1>
        <p>Don''t let this opportunity slip away</p>
      </div>
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
      
      <div class="features-list">
        <strong style="color: #1f2937; font-size: 16px;">Here''s what you''re missing out on:</strong>
        <ul>
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
    }
    .email-container::before {
      content: '''';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #ff9a9e, #fecfef, #e53e3e);
    }
    .header {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
      color: #c53030;
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
      border-top: 5px solid #e53e3e;
    }
    .header::before {
      content: '''';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .logo-container {
      background: rgba(255,255,255,0.95);
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      display: inline-block;
      margin-bottom: 20px;
    }
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .logo img {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: contain;
    }
    .company-tagline {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
      font-weight: 500;
    }
    .header h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 1px;
    }
    .header p {
      font-size: 18px;
      font-weight: 600;
      color: #744210;
    }
    .content { padding: 40px; }
    .greeting { 
      font-size: 20px; 
      color: #2d3748; 
      margin-bottom: 25px; 
      font-weight: 600;
    }
    .main-text { 
      font-size: 16px; 
      line-height: 1.7; 
      color: #4a5568; 
      margin-bottom: 25px; 
    }
    .final-warning { 
      background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); 
      border: 2px solid #fc8181; 
      color: #c53030; 
      padding: 30px; 
      border-radius: 16px; 
      text-align: center; 
      margin: 30px 0;
      box-shadow: 0 10px 25px rgba(252, 129, 129, 0.3);
    }
    .final-warning h2 { 
      margin: 0 0 15px 0; 
      font-size: 26px; 
      font-weight: 700; 
    }
    .final-warning p { 
      margin: 0; 
      font-size: 16px; 
      font-weight: 600; 
    }
    .countdown { 
      background: linear-gradient(135deg, #fffaf0 0%, #fef3c7 100%);
      border: 2px dashed #ed8936; 
      padding: 25px; 
      border-radius: 12px; 
      text-align: center; 
      margin: 25px 0;
    }
    .countdown h3 { 
      margin: 0 0 15px 0; 
      color: #c05621; 
      font-size: 20px; 
      font-weight: 700;
    }
    .countdown p { 
      margin: 0; 
      color: #2d3748; 
      font-weight: 600; 
      font-size: 15px;
    }
    .features-list {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #e53e3e;
    }
    .features-list ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .features-list li {
      margin: 10px 0;
      font-size: 15px;
      color: #374151;
    }
    .contact-info { 
      background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); 
      padding: 25px; 
      border-radius: 12px; 
      margin: 25px 0; 
      text-align: center;
      border: 1px solid #38a169;
    }
    .contact-info h3 { 
      margin: 0 0 15px 0; 
      color: #1a202c; 
      font-size: 20px; 
      font-weight: 700;
    }
    .contact-info p { 
      margin: 8px 0; 
      color: #1a202c; 
    }
    .phone { 
      font-weight: 700; 
      color: #38a169; 
      font-size: 20px; 
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      display: inline-block;
      margin: 10px 0;
    }
    .final-cta {
      text-align: center;
      margin: 30px 0;
      padding: 25px;
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      color: #ffffff;
      border-radius: 12px;
    }
    .final-cta h3 {
      margin: 0 0 10px 0;
      color: #ffffff;
      font-size: 20px;
    }
    .final-cta p {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .footer { 
      background: #1f2937; 
      color: #9ca3af; 
      padding: 30px; 
      text-align: center; 
      font-size: 14px;
    }
    .footer p { margin: 5px 0; }
    .footer strong { color: #f3f4f6; }
    @media (max-width: 768px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 28px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo">
            <img src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png" alt="BoostMySites Logo">
            <div class="company-tagline">AI-Powered Digital Solutions</div>
          </div>
        </div>
        <h1>🚨 FINAL NOTICE</h1>
        <p>Your 30% discount expires TODAY</p>
      </div>
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
      
      <div class="features-list">
        <strong style="color: #1f2937; font-size: 16px;">What you''ll get with BoostMySites BAAS:</strong>
        <ul>
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
      
      <div class="final-cta">
        <h3>Don''t let this opportunity pass.</h3>
        <p>Subscribe today and grow with BoostMySites BAAS! 🚀</p>
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
    (NEW.id, v_email, 'Don''t Miss Your 30% Discount', v_html_day3, v_now + interval '3 days', 'pending', jsonb_build_object('day', 3)),
    (NEW.id, v_email, 'Last Chance: 30% Discount Ends Today', v_html_day7, v_now + interval '7 days', 'pending', jsonb_build_object('day', 7));

  RETURN NEW;
END;
$$;
