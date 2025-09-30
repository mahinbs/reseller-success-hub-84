// Supabase Edge Function: email-dispatcher
// Schedules: Run every 1 minute via Supabase Scheduled Triggers
// Env vars required:
// - RESEND_API_KEY: API key for Resend
// - EMAIL_FROM: From address, e.g. "BoostMySites <no-reply@boostmysites.com>"
// - SUPABASE_URL: auto-injected
// - SUPABASE_SERVICE_ROLE_KEY: service role key

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API = 'https://api.resend.com/emails';

Deno.serve(async (req) => {
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('EMAIL_FROM') ?? 'BoostMySites Billing <noreply@baas.boostmysites.com>';

    console.log('Environment check:', {
      hasUrl: !!url,
      hasKey: !!key,
      hasResendKey: !!resendKey,
      from
    });

    if (!url || !key) {
      console.error('Missing Supabase env vars');
      return new Response('Supabase env missing', { status: 500 });
    }
    if (!resendKey) {
      console.error('Missing RESEND_API_KEY');
      return new Response('RESEND_API_KEY not set', { status: 500 });
    }

    const supabase = createClient(url, key);

    // Select pending + due emails in small batches
    // Include emails scheduled for immediate sending (Day 1) or past due time
    const { data: rows, error } = await supabase
      .from('email_queue')
      .select('id,user_id,email,subject,html,scheduled_at,status,meta')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Select error', error);
      return new Response('DB error', { status: 500 });
    }

    console.log(`Found ${rows?.length || 0} pending emails to process`);

    if (!rows || rows.length === 0) {
      return Response.json({ sent: 0 });
    }

    let sent = 0;
    for (const row of rows) {
      try {
        // Log which day email is being sent
        const meta = row.meta || {};
        const day = meta.day || 'unknown';
        console.log(`Sending Day ${day} email to ${row.email}`);

        const sendRes = await fetch(RESEND_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from,
            to: row.email,
            subject: row.subject,
            html: row.html
          })
        });

        if (!sendRes.ok) {
          const text = await sendRes.text();
          throw new Error(`Resend failed: ${sendRes.status} ${text}`);
        }

        const resendData = await sendRes.json();
        console.log(`Email sent successfully, Resend ID: ${resendData.id}`);

        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error: null
          })
          .eq('id', row.id);

        sent += 1;
      } catch (err) {
        console.error('Send failed', row.id, err);
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error: String(err)
          })
          .eq('id', row.id);
      }
    }

    console.log(`Processed ${sent} emails successfully`);
    return Response.json({ sent });
  } catch (e) {
    console.error('Unhandled error:', e);
    return new Response('Server error', { status: 500 });
  }
});
