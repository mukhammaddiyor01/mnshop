export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  defaultCommission: number;
  orderSmsTemplate: string;
  maintenanceMode: boolean;
}

export interface SiteSettingsInput {
  siteName?: string;
  contactEmail?: string;
  defaultCommission?: number;
  orderSmsTemplate?: string;
  maintenanceMode?: boolean;
}
