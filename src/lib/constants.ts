export const APP_NAME = 'Wahrly';
export const APP_TAGLINE = "Discover manufacturers by what they produce — or post a custom request and get protected offers from skilled makers.";
export const APP_DOMAIN = 'wahrly.com';
export const PLATFORM_FEE_PERCENT = 10;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  maker_selected: 'Maker Selected',
  payment_pending: 'Payment Pending',
  payment_secured: 'Payment Secured',
  in_production: 'In Production',
  ready_for_review: 'Ready for Review',
  completed: 'Completed',
  paid_to_maker: 'Paid to Maker',
  dispute: 'Dispute',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_STEPS = [
  'maker_selected',
  'payment_pending',
  'payment_secured',
  'in_production',
  'ready_for_review',
  'completed',
  'paid_to_maker',
] as const;

export const DISPUTE_REASONS = [
  { value: 'wrong_size', label: 'Wrong size' },
  { value: 'wrong_material', label: 'Wrong material' },
  { value: 'wrong_color', label: 'Wrong color' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'not_matching', label: 'Not matching description' },
  { value: 'not_completed', label: 'Not completed' },
  { value: 'other', label: 'Other' },
] as const;

export const POPULAR_CATEGORIES = [
  'furniture',
  'jewelry',
  'clothing',
  'art',
  'gifts',
  '3d-printing',
];
