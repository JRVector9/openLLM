const NEW_API_BASE_URL = process.env.NEW_API_BASE_URL || "http://localhost:3000";
const NEW_API_ADMIN_TOKEN = process.env.NEW_API_ADMIN_TOKEN || "";

interface NewApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface NewApiToken {
  id: number;
  key: string;
  name: string;
  status: number; // 1=enabled, 2=disabled
  used_quota: number;
  remain_quota: number;
  created_time: number;
  expired_time: number;
}

interface CreateTokenParams {
  name: string;
  remain_quota?: number;
  expired_time?: number;
  unlimited_quota?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<NewApiResponse<T>> {
  const url = `${NEW_API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${NEW_API_ADMIN_TOKEN}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`New API error (${res.status}): ${text}`);
  }

  return res.json();
}

export const newApiClient = {
  // Create a token for a user
  async createToken(params: CreateTokenParams): Promise<NewApiToken> {
    const res = await apiRequest<NewApiToken>("/api/token/", {
      method: "POST",
      body: JSON.stringify({
        name: params.name,
        remain_quota: params.remain_quota ?? 500000, // 5000 tokens = 500000 quota (100x)
        expired_time: params.expired_time ?? -1,
        unlimited_quota: params.unlimited_quota ?? false,
      }),
    });
    if (!res.success) throw new Error(res.message || "Failed to create token");
    return res.data!;
  },

  // List tokens
  async listTokens(): Promise<NewApiToken[]> {
    const res = await apiRequest<NewApiToken[]>("/api/token/?p=0&size=100");
    return res.data || [];
  },

  // Delete a token
  async deleteToken(tokenId: number): Promise<void> {
    const res = await apiRequest(`/api/token/${tokenId}`, {
      method: "DELETE",
    });
    if (!res.success) throw new Error(res.message || "Failed to delete token");
  },

  // Update token status (enable/disable)
  async updateTokenStatus(
    tokenId: number,
    status: number
  ): Promise<void> {
    const res = await apiRequest(`/api/token/`, {
      method: "PUT",
      body: JSON.stringify({ id: tokenId, status }),
    });
    if (!res.success)
      throw new Error(res.message || "Failed to update token status");
  },

  // Get usage logs
  async getUsageLogs(
    tokenId?: number,
    startTime?: number,
    endTime?: number
  ): Promise<unknown[]> {
    const params = new URLSearchParams({ p: "0", size: "1000" });
    if (tokenId) params.set("token_id", String(tokenId));
    if (startTime) params.set("start_timestamp", String(startTime));
    if (endTime) params.set("end_timestamp", String(endTime));

    const res = await apiRequest<unknown[]>(`/api/log/?${params}`);
    return res.data || [];
  },

  // Add a custom channel (for Ollama)
  async createChannel(params: {
    name: string;
    type: number;
    key: string;
    base_url: string;
    models: string;
    group?: string;
  }): Promise<unknown> {
    const res = await apiRequest("/api/channel/", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        group: params.group || "default",
      }),
    });
    if (!res.success)
      throw new Error(res.message || "Failed to create channel");
    return res.data;
  },

  // Test channel connectivity
  async testChannel(channelId: number, model: string): Promise<boolean> {
    try {
      const res = await apiRequest<{ success: boolean }>(
        `/api/channel/test/${channelId}`,
        {
          method: "GET",
        }
      );
      return res.success;
    } catch {
      return false;
    }
  },
};

export type { NewApiToken, CreateTokenParams };
