// 数据库类型定义
// 基于 database-schema.sql 生成的 TypeScript 类型

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      styles: {
        Row: Style;
        Insert: StyleInsert;
        Update: StyleUpdate;
      };
      feature_options: {
        Row: FeatureOption;
        Insert: FeatureOptionInsert;
        Update: FeatureOptionUpdate;
      };
      uploaded_images: {
        Row: UploadedImage;
        Insert: UploadedImageInsert;
        Update: UploadedImageUpdate;
      };
      generations: {
        Row: Generation;
        Insert: GenerationInsert;
        Update: GenerationUpdate;
      };
      generation_results: {
        Row: GenerationResult;
        Insert: GenerationResultInsert;
        Update: GenerationResultUpdate;
      };
      favorites: {
        Row: Favorite;
        Insert: FavoriteInsert;
        Update: FavoriteUpdate;
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: LikeUpdate;
      };
    };
  };
}

// 用户资料类型
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, any>;
  subscription_tier: 'free' | 'premium' | 'pro';
  credits_remaining: number;
  total_generations: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  preferences?: Record<string, any>;
  subscription_tier?: 'free' | 'premium' | 'pro';
  credits_remaining?: number;
  total_generations?: number;
}

export interface UserProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  preferences?: Record<string, any>;
  subscription_tier?: 'free' | 'premium' | 'pro';
  credits_remaining?: number;
  total_generations?: number;
}

// 样式类型
export interface Style {
  id: string;
  name: string;
  description: string | null;
  preview_url: string | null;
  prompt_description: string;
  reference_images: string[];
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StyleInsert {
  id: string;
  name: string;
  description?: string | null;
  preview_url?: string | null;
  prompt_description: string;
  reference_images?: string[];
  is_premium?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export interface StyleUpdate {
  name?: string;
  description?: string | null;
  preview_url?: string | null;
  prompt_description?: string;
  reference_images?: string[];
  is_premium?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

// 特征选项类型
export interface FeatureOption {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface FeatureOptionInsert {
  id: string;
  name: string;
  description?: string | null;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface FeatureOptionUpdate {
  name?: string;
  description?: string | null;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
}

// 上传图片类型
export interface UploadedImage {
  id: string;
  user_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  preview_path: string | null;
  upload_status: 'uploading' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface UploadedImageInsert {
  id?: string;
  user_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  preview_path?: string | null;
  upload_status?: 'uploading' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface UploadedImageUpdate {
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  storage_path?: string;
  preview_path?: string | null;
  upload_status?: 'uploading' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

// 生成任务类型
export interface Generation {
  id: string;
  user_id: string;
  uploaded_image_id: string;
  style_id: string;
  emphasis_features: string[];
  custom_features: string[];
  additional_elements: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message: string | null;
  title: string | null;
  is_public: boolean;
  likes_count: number;
  result_url: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface GenerationInsert {
  id?: string;
  user_id: string;
  uploaded_image_id: string;
  style_id: string;
  emphasis_features?: string[];
  custom_features?: string[];
  additional_elements?: string[];
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error_message?: string | null;
  title?: string | null;
  is_public?: boolean;
  likes_count?: number;
  result_url?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface GenerationUpdate {
  uploaded_image_id?: string;
  style_id?: string;
  emphasis_features?: string[];
  custom_features?: string[];
  additional_elements?: string[];
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error_message?: string | null;
  title?: string | null;
  is_public?: boolean;
  likes_count?: number;
  result_url?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

// 生成结果类型
export interface GenerationResult {
  id: string;
  generation_id: string;
  result_url: string;
  file_size: number | null;
  image_analysis: string | null;
  generation_prompt: string | null;
  api_response_data: Record<string, any>;
  created_at: string;
}

export interface GenerationResultInsert {
  id?: string;
  generation_id: string;
  result_url: string;
  file_size?: number | null;
  image_analysis?: string | null;
  generation_prompt?: string | null;
  api_response_data?: Record<string, any>;
}

export interface GenerationResultUpdate {
  result_url?: string;
  file_size?: number | null;
  image_analysis?: string | null;
  generation_prompt?: string | null;
  api_response_data?: Record<string, any>;
}

// 收藏类型
export interface Favorite {
  id: string;
  user_id: string;
  generation_id: string;
  created_at: string;
}

export interface FavoriteInsert {
  id?: string;
  user_id: string;
  generation_id: string;
}

export interface FavoriteUpdate {
  // 收藏表通常不需要更新
}

// 点赞类型
export interface Like {
  id: string;
  user_id: string;
  generation_id: string;
  created_at: string;
}

export interface LikeInsert {
  id?: string;
  user_id: string;
  generation_id: string;
}

export interface LikeUpdate {
  // 点赞表通常不需要更新
}

// 联合查询类型
export interface GenerationWithDetails extends Generation {
  uploaded_image: UploadedImage;
  style: Style;
  generation_result?: GenerationResult;
  user_profile: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
  is_liked?: boolean;
  is_favorited?: boolean;
}

export interface UserStats {
  total_generations: number;
  total_likes: number;
  total_favorites: number;
  credits_remaining: number;
  subscription_tier: 'free' | 'premium' | 'pro';
}

// API 响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// 生成请求类型
export interface GenerationRequest {
  imageId: string;
  styleId: string;
  emphasisFeatures: string[];
  customFeatures: string[];
  additionalElements: string[];
}

// 上传响应类型
export interface UploadResponse {
  success: boolean;
  imageId: string;
  previewUrl: string;
}

// 生成状态响应类型
export interface GenerationStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
}

// 样式分类
export interface StyleCategory {
  id: string;
  name: string;
  styles: Style[];
}

// 特征分类
export interface FeatureCategory {
  id: string;
  name: string;
  features: FeatureOption[];
}

// 用户偏好设置
export interface UserPreferences {
  defaultStyle?: string;
  autoPublic?: boolean;
  emailNotifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  language?: 'zh' | 'en';
}

// 存储桶路径类型
export interface StoragePaths {
  uploads: {
    original: (userId: string, imageId: string, extension: string) => string;
    preview: (userId: string, imageId: string) => string;
  };
  results: {
    final: (userId: string, generationId: string) => string;
  };
  system: {
    styleReference: (styleId: string, index: number) => string;
  };
}

// 错误类型
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}