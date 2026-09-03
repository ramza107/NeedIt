export type UserRole = 'buyer' | 'maker' | 'admin';

export type RequestStatus = 'open' | 'offers_received' | 'maker_selected' | 'closed' | 'cancelled';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type OrderStatus =
  | 'maker_selected'
  | 'payment_pending'
  | 'payment_secured'
  | 'in_production'
  | 'ready_for_review'
  | 'completed'
  | 'paid_to_maker'
  | 'dispute'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'secured' | 'released' | 'refunded' | 'failed';
export type DisputeReason =
  | 'wrong_size'
  | 'wrong_material'
  | 'wrong_color'
  | 'damaged'
  | 'not_matching'
  | 'not_completed'
  | 'other';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  location: string | null;
  city: string | null;
  rating: number;
  review_count: number;
  completed_orders: number;
  is_blocked: boolean;
  created_at: string;
}

export interface MakerProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  categories: string[];
  portfolio_urls: string[];
  location: string | null;
  city: string | null;
  phone: string | null;
  contact_person: string | null;
  rating: number;
  review_count: number;
  completed_orders: number;
  completion_rate: number;
  on_time_rate: number;
  dispute_rate: number;
  repeat_customer_rate: number;
  avg_price: number | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  cover_url?: string | null;
  is_promoted?: boolean;
  promo_headline?: string | null;
  promoted_at?: string | null;
  profile?: Profile;
}

export interface Request {
  id: string;
  buyer_id: string;
  category_id: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  location: string | null;
  city: string | null;
  delivery_type: string;
  status: RequestStatus;
  created_at: string;
  category?: Category;
  buyer?: Profile;
  images?: RequestImage[];
  offers?: Offer[];
  offer_count?: number;
}

export interface RequestImage {
  id: string;
  request_id: string;
  image_url: string;
  sort_order: number;
}

export interface Offer {
  id: string;
  request_id: string;
  maker_id: string;
  price: number;
  estimated_days: number;
  message: string | null;
  portfolio_urls: string[];
  status: OfferStatus;
  created_at: string;
  maker?: Profile;
  maker_profile?: MakerProfile;
}

export interface Order {
  id: string;
  request_id: string;
  buyer_id: string;
  maker_id: string;
  offer_id: string;
  price: number;
  platform_fee: number;
  maker_payout: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  agreed_details: Record<string, unknown>;
  completion_photos: string[];
  estimated_days: number | null;
  deadline: string | null;
  created_at: string;
  request?: Request;
  buyer?: Profile;
  maker?: Profile;
  offer?: Offer;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: string | null;
  is_system: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by: string;
  reason: DisputeReason;
  description: string;
  evidence_urls: string[];
  maker_response: string | null;
  status: 'open' | 'under_review' | 'resolved';
  resolution: string | null;
  created_at: string;
}
