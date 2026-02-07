-- HOYAAL DATABASE SCHEMA (SQL)
-- Run this in the Supabase SQL Editor

-- 1. Create User Roles Type
CREATE TYPE user_role AS ENUM ('SEEKER', 'OWNER', 'ADMIN'); 

-- 2. Create Profiles Table (Syncs with Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'SEEKER',
  rating DECIMAL(3,2) DEFAULT 5.0,
  avatar_url TEXT,
  push_token TEXT,
  is_premium BOOLEAN DEFAULT false,
  balance DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Properties Table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT CHECK (type IN ('Rent', 'Sale')),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'rented', 'sold')),
  verification_status TEXT DEFAULT 'unverified',
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reports Table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view reports" ON reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 4. Create Offers Table
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  seeker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see all profiles, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Everyone can see, but only Owners/Agents can create/edit
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Owners can insert their own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their own properties" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Offers Policies
CREATE POLICY "Seekers can view their own offers" ON offers FOR SELECT USING (auth.uid() = seeker_id);
CREATE POLICY "Owners can view offers for their properties" ON offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Seekers can insert offers" ON offers FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Owners can update offer status" ON offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'phone', new.phone),
    COALESCE(new.raw_user_meta_data->>'role', 'SEEKER')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create Favorites Table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, property_id)
);

-- 6. Create Chat Rooms Table
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Chat Participants Table
CREATE TABLE chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(room_id, user_id)
);

-- 8. Create Messages Table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Enable RLS for new tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Favorites Policies
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Chat Policies (Basic)
CREATE POLICY "Authenticated users can create rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Participants can view their rooms" ON chat_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants WHERE room_id = chat_rooms.id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert themselves as participants" ON chat_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can add property owners as participants" ON chat_participants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    JOIN properties p ON cr.property_id = p.id 
    WHERE cr.id = room_id AND p.owner_id = user_id
  )
);
CREATE POLICY "Participants can view each other" ON chat_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants cp_sub WHERE cp_sub.room_id = room_id AND cp_sub.user_id = auth.uid())
);

CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants WHERE room_id = messages.room_id AND user_id = auth.uid())
);
CREATE POLICY "Participants can insert messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (SELECT 1 FROM chat_participants WHERE room_id = messages.room_id AND user_id = auth.uid())
);

-- 10. Create Property Views Table (Analytics)
CREATE TABLE property_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(property_id, reviewer_id)
);

-- 12. Create Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT, -- 'message', 'verification', 'price_drop'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Enable RLS for Phase 3 tables
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Analytics Policies
CREATE POLICY "Owners can see views of their properties" ON property_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_views.property_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can insert views" ON property_views FOR INSERT WITH CHECK (true);

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 14. Create Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'subscription', 'withdrawal')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference TEXT, -- e.g., EVC Transaction ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
