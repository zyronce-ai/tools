import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    return new Response(JSON.stringify({ success: true, message: "OTP verified" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-otp error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});