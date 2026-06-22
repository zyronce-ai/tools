import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabaseAnon = createClient(
  supabaseUrl,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email === email) || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { firebaseToken } = req.body;
    if (!firebaseToken) return res.status(400).json({ error: "firebaseToken required" });

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decoded;
    if (!email) return res.status(400).json({ error: "Email not available from Firebase" });

    const meta = { full_name: name || email.split("@")[0], avatar_url: picture || "", firebase_uid: uid };

    const existingUser = await getUserByEmail(email);
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: meta });
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: meta,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !linkData?.properties?.email_otp) {
      throw new Error(linkError?.message || "Failed to generate OTP");
    }

    const { data: sessionData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
      email,
      token: linkData.properties.email_otp,
      type: "magiclink",
    });
    if (verifyError || !sessionData?.session) {
      console.error("verifyOtp error:", verifyError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    const session = {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user: {
        id: userId,
        email,
        user_metadata: meta,
      },
    };

    return res.status(200).json({ session, firebaseUid: uid });
  } catch (err: any) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: err.message });
  }
}