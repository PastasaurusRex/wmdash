export type Network = 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK';
export type PostType = 'VIDEO' | 'IMAGE' | 'REELS' | 'CAROUSEL' | 'TEXT';


export interface Post {
  id: string;
  network: Network;
  publishedAt: Date;
  postType: PostType;
  placement: string;
  boosted: boolean;
  text: string;
  url: string;
  impressions: number;
  reach: number | null;
  engagementRate: number; // Ratio 0-1
  engagements: number;
  fiscalYear: string;
}

export interface Filters {
  networks: Network[];
  postTypes: PostType[];
  placements: string[];
  selectedMonths: string[];
  selectedWeeks: string[];
  selectedFYs: string[];
  searchQuery: string;
  dateRange: { from: Date | undefined; to?: Date | undefined } | undefined;
}

export interface DashboardStats {
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  avgEngagementRate: number; // (totalEngagements * 100) / totalReach
}

export interface FollowerData {
  date: Date;
  month: string;
  facebook: number;
  instagram: number;
  tiktok: number;
  fiscalYear: string;
}
