export interface HostDashboardViewModel {
  firstName: string;
  metrics: {
    propertiesCount: number;
    applicationsCount: number;
    occupiedCount: number;
    availableCount: number;
  };
  properties: Array<{
    id: string;
    title: string;
    rentAmount: number;
    status: 'DRAFT' | 'PUBLISHED' | 'OCCUPIED';
  }>;
}
