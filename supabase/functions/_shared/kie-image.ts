/**
 * KIE.ai image generation helper for Supabase Edge Functions.
 *
 * Provides:
 * - kieGenerateImage(): text-to-image or image-editing via KIE API (async → poll → return base64)
 * - uploadBase64ToAiTemp(): upload base64 → Supabase storage → public URL (for image-edit input)
 *
 * Secrets needed in Supabase Edge Function env:
 *   KIE_API_KEY (required) — your KIE.ai API key
 *   KIE_IMAGE_MODEL (optional) — default "google/nano-banana-2-lite"
 *
 * Security: KIE_API_KEY stays in Supabase secrets (backend) — NEVER expose in frontend.
 */

const KIE_BASE = "https://api.kie.ai";

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
  // Parse base64 to binary
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid base64 image data");
  const mimeType = base64Match[1];
  const binaryStr = atob(base64Match[2]);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  // Determine extension from mime
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

  // Return public URL — ai-temp bucket must be public or use getPublicUrl
  return `${supabaseUrl}/storage/v1/object/public/ai-temp/${fileName}`;
}

/**
 * Generate an image via KIE.ai API.
 *
 * @param opts.prompt - Text prompt for image generation (required)
 * @param opts.imageUrls - Array of input image URLs for image-editing (optional)
 * @param opts.imageSize - Aspect ratio: "1:1", "16:9", "9:16", "4:3", "3:4", "auto" (default "1:1")
 * @param opts.model - Model name, default "google/nano-banana-2-lite"
 * @param opts.timeoutMs - Max poll time in ms, default 120000 (2 min)
 * @param opts.pollIntervalMs - How often to check status, default 2000ms
 *
 * Returns OpenAI-compatible response shape:
 *   { choices: [{ message: { images: [{ type: "image_url", image_url: { url: "<data URL>" } }] } }] }
 *
 * The returned image URL is a base64 data URL (not a remote URL), so frontend can render
 * without CORS issues.
 */
export interface KIEGenerateOptions {
  prompt: string;
  imageUrls?: string[];
  imageSize?: string;
  model?: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export async function kieGenerateImage(opts: KIEGenerateOptions): Promise<any> {
  const {
    prompt,
    imageUrls,
    imageSize = "1:1",
    model = Deno.env.get("KIE_IMAGE_MODEL") || "google/nano-banana-2-lite",
    timeoutMs = 120000,
    pollIntervalMs = 2000,
  } = opts;

  const apiKey = Deno.env.get("KIE_API_KEY");
  if (!apiKey) throw new Error("KIE_API_KEY not configured in Supabase secrets");

  // Step 1: Create task
  const createBody: any = {
    model,
    input: {
      prompt,
      output_format: "png",
      image_size: imageSize,
    },
  };
  if (imageUrls && imageUrls.length > 0) {
    createBody.input.image_urls = imageUrls;
  }

  const createResp = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createBody),
  });

  if (!createResp.ok) {
    const err = await createResp.text();
    throw new Error(`KIE createTask failed: ${createResp.status} - ${err}`);
  }

  const createData = await createResp.json();
  if (createData.code !== 200 || !createData.data?.taskId) {
    throw new Error(`KIE createTask invalid response: ${JSON.stringify(createData)}`);
  }
  const taskId = createData.data.taskId;

  // Step 2: Poll for completion
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    await new Promise(r => setTimeout(r, pollIntervalMs));

    const pollResp = await fetch(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!pollResp.ok) {
      const err = await pollResp.text();
      console.error("KIE poll error:", pollResp.status, err);
      continue;
    }

    const pollData = await pollResp.json();
    const state = pollData?.data?.state;

    if (state === "success") {
      // resultJson is a stringified JSON string: "{\"resultUrls\":[\"https://...\"]}"
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

      // Fetch first result URL and convert to data URL for frontend compatibility
      const resultUrl = resultUrls[0];
      const dataUrl = await fetchAsDataUrl(resultUrl);

      // Return in OpenAI-compatible shape (same as what Gemini would return)
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
      console.log(`KIE task ${taskId} status: ${state}`);
    } else {
      console.warn("Unknown KIE state:", state, pollData);
    }
  }

  throw new Error(`KIE task timed out after ${timeoutMs}ms (taskId: ${taskId})`);
}

/**
 * Quick helper for simple text-to-image (no input images).
 * Convenience wrapper around kieGenerateImage.
 */
export async function kieTextToImage(prompt: string, imageSize: string = "1:1"): Promise<any> {
  return kieGenerateImage({ prompt, imageSize });
}

/**
 * Quick helper for image-to-image (edit existing image).
 * Convenience wrapper around kieGenerateImage.
 */
export async function kieImageEdit(inputImageUrl: string, prompt: string, imageSize: string = "1:1"): Promise<any> {
  return kieGenerateImage({ prompt, imageUrls: [inputImageUrl], imageSize });
}