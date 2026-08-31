export type Region = 'ARCTIC' | 'ANTARCTIC' | 'HIMALAYA' | 'SOUTHERN_OCEAN';
export type ExpeditionStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Publication {
  id: string;
  title: string;
  doi: string;
  published_date: string;
  expedition_id?: string;
}

export interface Media {
  id: string;
  title: string;
  type: 'PHOTO' | 'VIDEO' | 'TELEMETRY' | string;
  thumbnail_url: string;
  file_url: string;
  expedition_id?: string;
}

export interface Dataset {
  id: string;
  title: string;
  format: string;
  download_count: number;
}

export interface Expedition {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description: string;
  region: Region;
  status: ExpeditionStatus;
  start_date: string;
  end_date?: string;
  cover_image_url?: string;
  leader_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  leader?: { name: string };
  created_by_user?: { name: string };
}

export interface ExpeditionDetail extends Expedition {
  leader?: User;
  created_by_user?: { id: string; name: string };
  publications?: Publication[];
  media?: Media[];
  datasets?: Dataset[];
}

export interface ExpeditionStats {
  publications: number;
  media: number;
  datasets: number;
  totalDownloads: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResults {
  expeditions?: Expedition[];
  publications?: Publication[];
  datasets?: Dataset[];
  media?: Media[];
}
