-- MakeIt Marketplace Schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, icon) VALUES
  ('Furniture', 'furniture', '🪑'),
  ('Jewelry', 'jewelry', '💎'),
  ('Clothing', 'clothing', '👕'),
  ('Art', 'art', '🎨'),
  ('Home Decor', 'home-decor', '🏠'),
  ('Woodworking', 'woodworking', '🪵'),
  ('Metalwork', 'metalwork', '⚙️'),
  ('3D Printing', '3d-printing', '🖨️'),
  ('Gifts', 'gifts', '🎁'),
  ('Wedding', 'wedding', '💒'),
  ('Custom Accessories', 'custom-accessories', '👜'),
  ('Leather', 'leather', '🧥'),
  ('Toys', 'toys', '🧸'),
  ('Other', 'other', '📦');

-- User profiles (extends auth.users)
CREATE TYPE user_role AS ENUM ('buyer', 'maker', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  location TEXT,
  city TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maker profiles
CREATE TABLE maker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  categories UUID[] DEFAULT '{}',
  portfolio_urls TEXT[] DEFAULT '{}',
  location TEXT,
  city TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 100,
  on_time_rate NUMERIC(5,2) DEFAULT 100,
  dispute_rate NUMERIC(5,2) DEFAULT 0,
  repeat_customer_rate NUMERIC(5,2) DEFAULT 0,
  avg_price NUMERIC(10,2),
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request statuses
CREATE TYPE request_status AS ENUM (
  'open',
  'offers_received',
  'maker_selected',
  'closed',
  'cancelled'
);

-- Requests (buyer posts what they want)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  deadline DATE,
  location TEXT,
  city TEXT,
  delivery_type TEXT DEFAULT 'either',
  status request_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE request_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer statuses
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  message TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  status offer_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, maker_id)
);

-- Order statuses
CREATE TYPE order_status AS ENUM (
  'maker_selected',
  'payment_pending',
  'payment_secured',
  'in_production',
  'ready_for_review',
  'completed',
  'paid_to_maker',
  'dispute',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'secured',
  'released',
  'refunded',
  'failed'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  maker_id UUID NOT NULL REFERENCES profiles(id),
  offer_id UUID NOT NULL REFERENCES offers(id),
  price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  maker_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  status order_status DEFAULT 'maker_selected',
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  agreed_details JSONB DEFAULT '{}',
  completion_photos TEXT[] DEFAULT '{}',
  estimated_days INTEGER,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order change requests
CREATE TYPE change_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE order_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  new_price NUMERIC(10,2),
  new_days INTEGER,
  status change_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)
);

-- Disputes
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE dispute_reason AS ENUM (
  'wrong_size', 'wrong_material', 'wrong_color',
  'damaged', 'not_matching', 'not_completed', 'other'
);
CREATE TYPE dispute_resolution AS ENUM (
  'full_refund', 'partial_refund', 'free_remake', 'pay_maker', 'none'
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  opened_by UUID NOT NULL REFERENCES profiles(id),
  reason dispute_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  maker_response TEXT,
  status dispute_status DEFAULT 'open',
  resolution dispute_resolution,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES requests(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_buyer ON requests(buyer_id);
CREATE INDEX idx_requests_category ON requests(category_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_offers_request ON offers(request_id);
CREATE INDEX idx_offers_maker ON offers(maker_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_maker ON orders(maker_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_order ON messages(order_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER maker_profiles_updated_at BEFORE UPDATE ON maker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('request-images', 'request-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('completions', 'completions', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Maker profiles
CREATE POLICY "Maker profiles are viewable by everyone" ON maker_profiles FOR SELECT USING (true);
CREATE POLICY "Makers can insert own profile" ON maker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Makers can update own profile" ON maker_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Requests
CREATE POLICY "Requests are viewable by everyone" ON requests FOR SELECT USING (true);
CREATE POLICY "Buyers can create requests" ON requests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own requests" ON requests FOR UPDATE USING (auth.uid() = buyer_id);

-- Request images
CREATE POLICY "Request images are viewable by everyone" ON request_images FOR SELECT USING (true);
CREATE POLICY "Buyers can insert request images" ON request_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM requests WHERE id = request_id AND buyer_id = auth.uid()));
CREATE POLICY "Buyers can delete own request images" ON request_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM requests WHERE id = request_id AND buyer_id = auth.uid()));

-- Offers
CREATE POLICY "Offers viewable by request owner and maker" ON offers FOR SELECT USING (
  auth.uid() = maker_id OR
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND buyer_id = auth.uid())
);
CREATE POLICY "Makers can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = maker_id);
CREATE POLICY "Makers can update own offers" ON offers FOR UPDATE USING (auth.uid() = maker_id);
CREATE POLICY "Buyers can update offers on their requests" ON offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM requests WHERE id = request_id AND buyer_id = auth.uid()));

-- Orders
CREATE POLICY "Orders viewable by participants" ON orders FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = maker_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = maker_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order changes
CREATE POLICY "Order changes viewable by participants" ON order_changes FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid()))
);
CREATE POLICY "Participants can create order changes" ON order_changes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid()))
);
CREATE POLICY "Participants can update order changes" ON order_changes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid()))
);

-- Messages
CREATE POLICY "Messages viewable by order participants" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid()))
);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Participants can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Disputes
CREATE POLICY "Disputes viewable by participants and admin" ON disputes FOR SELECT USING (
  auth.uid() = opened_by OR
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Participants can open disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = opened_by);
CREATE POLICY "Admin can update disputes" ON disputes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND maker_id = auth.uid())
);

-- Reports
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admin can view reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
