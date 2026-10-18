// OTP sending removed - will be rebuilt later
// This function is disabled

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(JSON.stringify({
    success: false,
    error: "Auth system temporarily disabled. Please try again later."
  }), {
    status: 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
