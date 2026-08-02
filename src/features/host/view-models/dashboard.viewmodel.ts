export interface AttentionItem {
  id: string;
  title: string;
  type: 'urgent' | 'warning' | 'success';
  href: string | null;
}

export interface DashboardKPIs {
  publishedCount: number;
  draftsCount: number;
  pendingBookingsCount: number;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  href: string | null;
  actionText: string;
}

export interface HostDashboardViewModel {
  firstName: string;
  attentionItems: AttentionItem[];
  kpis: DashboardKPIs;
  quickActions: QuickAction[];
  hasListings: boolean;
}
