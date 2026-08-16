export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface CategoryPerformance {
  category: string;
  sold: number;
  revenue: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sold: number;
  revenue: number;
}

export interface AdminAnalytics {
  revenueToday: number;
  revenueLast7Days: RevenuePoint[];
  categoryPerformance: CategoryPerformance[];
  topProducts: TopProduct[];
}
