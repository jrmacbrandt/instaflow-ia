export type PostMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_timezone: string;
  ai_default_tone: string;
  created_at: string;
  updated_at: string;
}

export interface InstagramAccount {
  id: string;
  user_id: string;
  instagram_business_account_id: string;
  facebook_page_id: string;
  access_token: string;
  token_expires_at: string | null;
  instagram_username: string;
  profile_pic_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  instagram_account_id: string | null;
  caption: string | null;
  media_type: PostMediaType;
  media_urls: string[]; // JSON array of public media URLs
  scheduled_at: string | null;
  status: PostStatus;
  instagram_post_id?: string | null;
  instagram_permalink?: string | null;
  failure_reason?: string | null;
  ai_generated?: boolean;
  ai_prompt?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  instagram_account?: InstagramAccount | null;
}

export interface PublicationLog {
  id: string;
  post_id: string;
  attempt: number;
  action: string;
  request_payload: any;
  response_status: number;
  response_body: any;
  error_message?: string | null;
  created_at: string;
}

export interface AiUsage {
  id: string;
  user_id: string;
  date: string;
  text_generations: number;
  image_generations: number;
  created_at: string;
}

export interface GenerateCaptionOptions {
  prompt: string;
  tone?: string;
  includeEmojis?: boolean;
  hashtagCount?: number;
  niche?: string;
  callToAction?: string;
}
