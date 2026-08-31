import { ApiResponse, Expedition, ExpeditionDetail, ExpeditionStats, Media, Publication, Dataset, SearchResults, OutreachArticle } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Generic API fetch helper
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Fallback to default message if body is not JSON
      }
      throw new Error(errorMessage);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  /**
   * Get all expeditions with optional query filters
   */
  async getExpeditions(params?: {
    limit?: number;
    page?: number;
    region?: string;
    status?: string;
    year?: number;
    search?: string;
    sortBy?: 'start_date' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Expedition[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }

    const queryString = query.toString();
    const endpoint = `/expeditions${queryString ? `?${queryString}` : ''}`;
    return fetchAPI<Expedition[]>(endpoint);
  },

  /**
   * Get single expedition by slug or ID
   */
  async getExpeditionDetails(idOrSlug: string): Promise<ApiResponse<ExpeditionDetail>> {
    if (!idOrSlug) {
      throw new Error('Expedition ID or slug is required');
    }
    return fetchAPI<ExpeditionDetail>(`/expeditions/${idOrSlug}`);
  },

  /**
   * Get stats for a specific expedition
   */
  async getExpeditionStats(id: string): Promise<ApiResponse<ExpeditionStats>> {
    if (!id) {
      throw new Error('Expedition ID is required');
    }
    return fetchAPI<ExpeditionStats>(`/expeditions/${id}/stats`);
  },

  /**
   * Get media with optional type and expedition filters
   */
  async getMedia(params?: {
    type?: string;
    expeditionId?: string;
  }): Promise<ApiResponse<Media[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }

    const queryString = query.toString();
    const endpoint = `/media${queryString ? `?${queryString}` : ''}`;
    return fetchAPI<Media[]>(endpoint);
  },

  /**
   * Get all publications
   */
  async getPublications(): Promise<ApiResponse<Publication[]>> {
    return fetchAPI<Publication[]>('/publications');
  },

  /**
   * Get all datasets
   */
  async getDatasets(): Promise<ApiResponse<Dataset[]>> {
    return fetchAPI<Dataset[]>('/datasets');
  },

  /**
   * Get dataset download URL endpoint
   */
  getDatasetDownloadUrl(id: string): string {
    return `${API_BASE_URL}/datasets/${id}/download`;
  },

  /**
   * Perform global search
   */
  async getSearchResults(query: string): Promise<ApiResponse<SearchResults>> {
    if (!query) {
      throw new Error('Search query is required');
    }
    return fetchAPI<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get all published outreach articles
   */
  async getPublishedOutreach(): Promise<ApiResponse<OutreachArticle[]>> {
    return fetchAPI<OutreachArticle[]>('/outreach/published');
  }
};
export default api;
