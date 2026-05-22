const ACTIVATION_API_URL = 'https://api.gstfilingapp.com/v1/validate-key';

export interface ActivationResponse {
  valid: boolean;
  message: string;
  plan?: string;
  expiresAt?: string;
}

export async function validateActivationKey(key: string): Promise<ActivationResponse> {
  if (!key.trim()) {
    return { valid: false, message: 'Activation key is required.' };
  }

  try {
    const response = await fetch(ACTIVATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activationKey: key.trim() }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        valid: data.valid ?? true,
        message: data.message ?? 'Key validated successfully.',
        plan: data.plan,
        expiresAt: data.expiresAt,
      };
    }

    if (response.status === 400 || response.status === 403) {
      const data = await response.json().catch(() => null);
      return {
        valid: false,
        message: data?.message ?? 'Invalid activation key.',
      };
    }

    return { valid: false, message: 'Server error. Please try again later.' };
  } catch {
    return { valid: false, message: 'Unable to reach activation server. Please check your connection and try again.' };
  }
}
