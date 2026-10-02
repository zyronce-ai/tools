import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, type } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Supabase (you'll need a table or use Redis/cache)
    // For now, we'll just send the email

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const subject = type === "signup"
      ? "Welcome to NayraTools — Verify Your Email"
      : "Your NayraTools Login OTP";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); border-radius: 12px; text-align: center; line-height: 56px;">
                      <span style="color: #ffffff; font-size: 24px; font-weight: bold;">N</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="color: #1a1a2e; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
                ${type === "signup" ? "Welcome to NayraTools!" : "Your Login Code"}
              </h1>

              <!-- Message -->
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                ${type === "signup"
                  ? "Thanks for joining NayraTools! Use the code below to verify your email and start selling smarter."
                  : "Use the code below to log in to your NayraTools account. This code expires in 10 minutes."}
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); border-radius: 16px; padding: 24px 40px; box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);">
                      <span style="color: #ffffff; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;">${Math.floor(100000 + Math.random() * 900000).toString()}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <p style="color: #8888a0; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
              </p>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eeeeef;">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #8888a0; font-size: 12px; margin: 0 0 8px 0;">&copy; 2025 NayraTools. All rights reserved.</p>
                    <p style="color: #8888a0; font-size: 12px; margin: 0;">tool.nayratrendz.in | support@nayratools.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NayraTools <noreply@tool.nayratrendz.in>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend error:", res.status, error);
      throw new Error(`Resend failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("OTP email sent:", data);

    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resend-otp error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});