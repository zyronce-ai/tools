import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(authHeader.slice(7));
    const { full_name, avatar_url } = req.body;

    if (full_name) {
      await admin.auth().updateUser(decoded.uid, { displayName: full_name });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    const existingUser = data.users.find(u => u.email === decoded.email);

    if (existingUser) {
      const updates: any = { user_metadata: { ...existingUser.user_metadata } };
      if (full_name) updates.user_metadata.full_name = full_name;
      if (avatar_url) updates.user_metadata.avatar_url = avatar_url;
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, updates);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}