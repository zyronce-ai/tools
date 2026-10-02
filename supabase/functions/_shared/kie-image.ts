/**
 * KIE.ai image generation helper for Supabase Edge Functions.
 *
 * Secrets needed in Supabase Edge Function env:
 *   KIE_API_KEY (required) — your KIE.ai API key
 *   KIE_IMAGE_MODEL (optional) — default "google/nano-banana-2"
 *   KIE_WEBHOOK_URL (optional) — if set, use webhook instead of polling
 *   KIE_TRY_ALL_MODELS (optional) — "1" to try fallback models on 422
 *   KIE_IMAGE_SIZES (optional) — comma-separated list of sizes to try, e.g. "1:1,1024x1024,auto"
 *
 * Security: KIE_API_KEY stays in Supabase secrets (backend) — NEVER expose in frontend.
 */

const KIE_BASE = "https://api.kie.ai";

/** Try these model names in order until one works. */
const KIE_MODEL_CANDIDATES = [
  "google/nano-banana-2",
  "google/nano-banana",
  "nano-banana-2",
  "nano-banana",
];

/** Image size formats to try (KIE docs vary). */
const KIE_SIZE_CANDIDATES = (Deno.env.get("KIE_IMAGE_SIZES") || "1:1,1024x1024,auto")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

/**
 * Convert a remote image URL to a base64 data URL (for KIE input if needed).
 * If already a data URL, return as-is.
 */
export async function fetchAsDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload a base64 image to Supabase ai-temp storage bucket, return public URL.
 * Used for image-editing tools (e.g., BG Remover lifestyle) to give KIE an input image URL.
 */
export async function uploadBase64ToAiTemp(base64Data: string, fileNamePrefix: string): Promise<string> {
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid base64 image data");
  const mimeType = base64Match[1];
  const binaryStr = atob(base64Match[2]);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  const extMap: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
  const ext = extMap[mimeType] || "png";
  const fileName = `${fileNamePrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

  const uploadResp = await fetch(`${supabaseUrl}/storage/v1/object/ai-temp/${fileName}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": mimeType,
    },
    body: blob,
  });

  if (!uploadResp.ok) {
    const err = await uploadResp.text();
    throw new Error(`Upload to Supabase failed: ${uploadResp.status} - ${err}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/ai-temp/${fileName}`;
}

export interface KIEGenerateOptions {
  prompt: string;
  imageUrls?: string[];
  imageSize?: string;
  model?: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
  /** If provided, KIE will POST results here instead of polling. Must be a public HTTPS URL. */
  webhookUrl?: string;
}

/**
 * Generate an image via KIE.ai API with robust model/size fallback and optional webhook.
 */
export async function kieGenerateImage(opts: KIEGenerateOptions): Promise<any> {
  const {
    prompt,
    imageUrls,
    imageSize = "1:1",
    model = Deno.env.get("KIE_IMAGE_MODEL") || "google/nano-banana-2",
    timeoutMs = 300000,
    pollIntervalMs = 3000,
    webhookUrl = Deno.env.get("KIE_WEBHOOK_URL"),
  } = opts;

  const apiKey = Deno.env.get("KIE_API_KEY");
  if (!apiKey) throw new Error("KIE_API_KEY not configured in Supabase secrets");

  // Build candidate list — ALWAYS try all candidates by default for robustness.
  // Set KIE_TRY_ALL_MODELS=0 to disable fallback (not recommended).
  const tryAll = Deno.env.get("KIE_TRY_ALL_MODELS") !== "0";
  const candidates = tryAll
    ? (model && !KIE_MODEL_CANDIDATES.includes(model) ? [model, ...KIE_MODEL_CANDIDATES] : KIE_MODEL_CANDIDATES)
    : [model || KIE_MODEL_CANDIDATES[0]];

  let taskId: string | null = null;
  let modelUsed = "";
  let sizeUsed = "";

  // Step 1: Create task — try each model/size combo until createTask returns a taskId.
  for (const candidate of candidates) {
    for (const sizeCandidate of KIE_SIZE_CANDIDATES) {
      const createBody: any = {
        model: candidate,
        input: {
          prompt,
          output_format: "png",
          image_size: sizeCandidate,
        },
      };
      if (imageUrls && imageUrls.length > 0) {
        createBody.input.image_urls = imageUrls;
      }
      if (webhookUrl) {
        createBody.webhook_url = webhookUrl;
      }

      console.log(`KIE: trying model="${candidate}" size="${sizeCandidate}"...`);

      const createResp = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createBody),
      });

      // 422 = unsupported model/size → try next
      if (createResp.status === 422) {
        const errBody = await createResp.text();
        console.warn(`KIE rejected model="${candidate}" size="${sizeCandidate}" (422): ${errBody}`);
        if (!tryAll) {
          throw new Error(`Model/size combo not supported by KIE. Try a different model or check https://kie.ai/market`);
        }
        continue;
      }

      if (!createResp.ok) {
        const err = await createResp.text();
        throw new Error(`KIE createTask failed: ${createResp.status} - ${err}`);
      }

      const createData = await createResp.json();
      if (createData.code === 200 && createData.data?.taskId) {
        taskId = createData.data.taskId;
        modelUsed = candidate;
        sizeUsed = sizeCandidate;
        console.log(`KIE: task ${taskId} created with model="${modelUsed}" size="${sizeUsed}"`);
        break;
      }

      if (createData.code === 422) {
        console.warn(`KIE model="${candidate}" size="${sizeCandidate}" unsupported (body): ${createData.msg}`);
        if (!tryAll) {
          throw new Error(`Model/size not supported. ${createData.msg}`);
        }
        continue;
      }

      console.warn(`KIE createTask unusual for model="${candidate}" size="${sizeCandidate}": ${JSON.stringify(createData)}`);
      throw new Error(`KIE createTask invalid: ${JSON.stringify(createData)}`);
    }
    if (taskId) break;
  }

  if (!taskId) {
    throw new Error("KIE: no model/size combo accepted. Check https://kie.ai/market for available models.");
  }

  // If webhook provided, KIE will call it when done — we return immediately.
  // Frontend will need to handle async completion (poll / websocket / refetch).
  if (webhookUrl) {
    console.log(`KIE: webhook set to ${webhookUrl}, returning taskId immediately`);
    return { taskId, modelUsed, sizeUsed, webhook: true };
  }

  // Step 2: Poll for completion
  const startTime = Date.now();
  let lastLoggedState = "";
  while (Date.now() - startTime < timeoutMs) {
    await new Promise(r => setTimeout(r, pollIntervalMs));

    const pollResp = await fetch(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!pollResp.ok) {
      const err = await pollResp.text();
      console.error(`KIE poll error (${pollResp.status}):`, err);
      continue;
    }

    const pollData = await pollResp.json();
    const state = pollData?.data?.state;

    // Only log state changes to reduce log spam
    if (state && state !== lastLoggedState) {
      console.log(`KIE task ${taskId} status: ${state}`);
      lastLoggedState = state;
    }

    if (state === "success") {
      let resultUrls: string[] = [];
      try {
        const parsed = typeof pollData.data.resultJson === "string"
          ? JSON.parse(pollData.data.resultJson)
          : pollData.data.resultJson;
        resultUrls = parsed?.resultUrls || [];
      } catch (e) {
        console.error("Failed to parse resultJson:", e);
      }

      if (!resultUrls || resultUrls.length === 0) {
        throw new Error("KIE success but no resultUrls in response");
      }

      const resultUrl = resultUrls[0];
      const dataUrl = await fetchAsDataUrl(resultUrl);

      return {
        choices: [
          {
            message: {
              images: [
                { type: "image_url", image_url: { url: dataUrl } }
              ],
            },
          },
        ],
      };
    } else if (state === "fail" || state === "failed") {
      const failMsg = pollData?.data?.failMsg || pollData?.msg || "Unknown KIE failure";
      throw new Error(`KIE task failed: ${failMsg}`);
    } else if (state === "waiting" || state === "queuing" || state === "generating") {
      // Still processing, continue polling
    } else {
      console.warn("Unknown KIE state:", state, pollData);
    }
  }

  throw new Error(`KIE task timed out after ${timeoutMs}ms (taskId: ${taskId})`);
}

/**
 * Quick helper for simple text-to-image (no input images).
 */
export async function kieTextToImage(prompt: string, imageSize: string = "1:1"): Promise<any> {
  return kieGenerateImage({ prompt, imageSize });
}

/**
 * Quick helper for image-to-image (edit existing image).
 */
export async function kieImageEdit(inputImageUrl: string, prompt: string, imageSize: string = "1:1"): Promise<any> {
  return kieGenerateImage({ prompt, imageUrls: [inputImageUrl], imageSize });
}