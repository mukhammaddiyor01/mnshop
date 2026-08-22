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

export interface SellerOverview {
  totalSales: number;
  revenue: number;
  ordersToday: number;
  activeListings: number;
  recentOrders: unknown[];
}

export interface SellerAnalytics {
  revenue: number;
  paidOrders: number;
  views: number;
  likes: number;
  products: number;
  orderPipeline: Record<string, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    sold: number;
    views: number;
    likes: number;
    revenue: number;
  }>;
}
