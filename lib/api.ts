export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://blockchain-secure-medical-data.onrender.com';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // If Body is FormData, remove Content-Type to let browser set it with boundary
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse JSON error, fallback to text
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, try to get text
      const errorText = await response.text().catch(() => '');
      if (errorText) {
        errorMessage = `${response.status}: ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
