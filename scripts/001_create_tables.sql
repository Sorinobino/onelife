-- OneLife Cloud KPI Database Schema
-- Settings table (app configuration per user)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_guests INTEGER DEFAULT 10,
  cost_per_guest NUMERIC(10,2) DEFAULT 50.00,
  target_occupancy NUMERIC(5,2) DEFAULT 70.00,
  target_rating NUMERIC(3,2) DEFAULT 4.50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Logs table (daily activity records)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 0,
  income NUMERIC(10,2) NOT NULL DEFAULT 0,
  expenses NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Settings RLS policies
CREATE POLICY "settings_select_own" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "settings_delete_own" ON settings FOR DELETE USING (auth.uid() = user_id);

-- Logs RLS policies
CREATE POLICY "logs_select_own" ON logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_own" ON logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logs_delete_own" ON logs FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-create settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();
