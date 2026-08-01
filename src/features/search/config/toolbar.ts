export interface ToolbarFilterDef {
  id: string;
  type: 'quick' | 'sheet';
  label: string;
  icon?: string;
  mobile: boolean;
  desktop: boolean;
  order: number;
  priority: number;
  enabled: boolean;
  requiresMap: boolean;
  requiresLocation: boolean;
  defaultVisible: boolean;
}

export const SEARCH_TOOLBAR_SCHEMA: ToolbarFilterDef[] = [
  {
    id: 'price',
    type: 'quick',
    label: 'Price',
    mobile: true,
    desktop: true,
    order: 1,
    priority: 1,
    enabled: true,
    requiresMap: false,
    requiresLocation: false,
    defaultVisible: true,
  },
  {
    id: 'type',
    type: 'quick',
    label: 'Type',
    mobile: true,
    desktop: true,
    order: 2,
    priority: 1,
    enabled: true,
    requiresMap: false,
    requiresLocation: false,
    defaultVisible: true,
  },
  {
    id: 'furnishing',
    type: 'quick',
    label: 'Furnishing',
    mobile: true,
    desktop: true,
    order: 3,
    priority: 2,
    enabled: true,
    requiresMap: false,
    requiresLocation: false,
    defaultVisible: true,
  },
  {
    id: 'gender',
    type: 'quick',
    label: 'Gender',
    mobile: true,
    desktop: true,
    order: 4,
    priority: 2,
    enabled: true,
    requiresMap: false,
    requiresLocation: false,
    defaultVisible: true,
  },
  {
    id: 'more',
    type: 'sheet',
    label: 'More Filters',
    mobile: true,
    desktop: true,
    order: 99,
    priority: 1,
    enabled: true,
    requiresMap: false,
    requiresLocation: false,
    defaultVisible: true,
  },
];
