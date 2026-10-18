# OTP Authentication Deployment Guide

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Resend API Key: https://resend.com/api-keys

## Step 1: Database Setup

Run this SQL in Supabase Dashboard > SQL Editor:

```sql
-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verification (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verification(email, type);
```

## Step 2: Set Environment Secrets

In Supabase Dashboard > Edge Functions > Secrets, add:

```
RESEND_API_KEY=re_xxxxx  (from resend.com)
SUPABASE_URL=https://kfgmndeeeivakfvboeng.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  (from Supabase settings > API)
```

## Step 3: Deploy Edge Functions

```bash
cd C:\Users\jojo\Documents\lovable-project-d1096c27

# Login to Supabase
supabase login

# Link project
supabase link --project-ref kfgmndeeeivakfvboeng

# Deploy functions
supabase functions deploy resend-otp
supabase functions deploy verify-otp
```

## Step 4: Test

1. Open https://tool.nayratrendz.in/login
2. Enter email → "Send Login OTP"
3. Check email for 6-digit code
4. Enter code → "Verify OTP"
5. Should redirect to /chat

## Troubleshooting

**"Unexpected token '<'" error:**
- Functions not deployed. Run step 3 again.
- Check Supabase Dashboard > Edge Functions to see if deployed.

**"Invalid or expired OTP":**
- Check `otp_verification` table in Supabase > Table Editor
- Verify OTP was stored and not expired (10 min limit)

**"Failed to send OTP":**
- Check RESEND_API_KEY is set correctly
- Verify sender email domain in Resend dashboard

**"Failed to get session tokens":**
- Check Edge Function logs in Supabase Dashboard
- Look for console.error messages with actual response

## Edge Function URLs

After deployment:
- resend-otp: `https://kfgmndeeeivakfvboeng.supabase.co/functions/v1/resend-otp`
- verify-otp: `https://kfgmndeeeivakfvboeng.supabase.co/functions/v1/verify-otp`
