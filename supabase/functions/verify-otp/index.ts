import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, otp, type } = await req.json();
    if (!email || !otp) {
      return new Response(JSON.stringify({ success: false, error: "Email and OTP required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Find matching OTP
    const res = await fetch(
      `${supabaseUrl}/rest/v1/otp_verification?email=eq.${encodeURIComponent(email)}&type=eq.${type}&used=eq.false&otp=eq.${otp}&limit=1`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to verify OTP");
    }

    const records = await res.json();
    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired OTP" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as used
    await fetch(
      `${supabaseUrl}/rest/v1/otp_verification?id=eq.${records[0].id}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ used: true }),
      }
    );

    // Ensure user exists in Supabase Auth
    let userId: string;
    const { data: existingUser } = await supabaseAdmin.auth.adminGetUserByEmail(email);
    if (existingUser?.user?.id) {
      userId = existingUser.user.id;
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.adminCreateUser({
        email: email,
        email_confirmed: true,
      });
      if (createErr || !newUser?.user?.id) {
        console.error("Admin create user error:", createErr);
        return new Response(JSON.stringify({ success: false, error: "Failed to create user" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = newUser.user.id;
    }

    // Generate a session for this user
    const { data: sessionData, error: sessionErr } = await supabaseAdmin.auth.adminGenerateSessionForUser(userId);
    if (sessionErr || !sessionData?.session) {
      console.error("Session generation error:", sessionErr);
      return new Response(JSON.stringify({ success: false, error: "Failed to create session" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "OTP verified",
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
        user: { id: userId, email: email },
      },
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-otp error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});