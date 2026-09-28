const DIRECT_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE_URLS = [DIRECT_BASE_URL];

async function requestWithFallback(path, options) {
  let lastError = null;

  for (const base of API_BASE_URLS) {
    try {
      const response = await fetch(`${base}${path}`, options);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to reach backend service");
}

export async function checkBackendHealth() {
  for (const base of API_BASE_URLS) {
    try {
      const response = await fetch(`${base}/`, { method: "GET" });
      if (response.ok) return true;
    } catch {
      // Try next base URL.
    }
  }
  return false;
}

export async function transcribeAudio(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", options.mode || "transcribe");
  if (options.target_lang) formData.append("target_lang", options.target_lang);

  const response = await requestWithFallback("/transcribe/", {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export async function transcribeFromUrl(url) {
  const response = await requestWithFallback("/transcribe-url/", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  return response.json();
}
