const STORAGE_KEY = "nayra_gemini_api_key";

export function getGeminiApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setGeminiApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function removeGeminiApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasGeminiApiKey(): boolean {
  return !!getGeminiApiKey();
}
