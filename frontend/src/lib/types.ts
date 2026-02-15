// Database types matching Supabase schema

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  total_quota: number;
  used_quota: number;
  max_keys: number;
  created_at: string;
  updated_at: string;
}

export interface UserApiKey {
  id: string;
  user_id: string;
  key_name: string;
  new_api_token_id: number;
  key_preview: string; // First 8 chars + "..." for display
  is_active: boolean;
  used_quota: number;
  remain_quota: number;
  created_at: string;
}

export interface UserOllamaServer {
  id: string;
  user_id: string;
  server_name: string;
  server_url: string;
  is_active: boolean;
  last_health_check: string | null;
  models: string[];
  new_api_channel_id: number | null;
  created_at: string;
}

export interface UsageLog {
  id: number;
  token_id: number;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

export interface DailyUsage {
  date: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
}

export interface ApiKeyCreateRequest {
  name: string;
}

export interface ApiKeyCreateResponse {
  key: string;
  key_name: string;
  key_preview: string;
}
