-- Schema Requests Table
-- For users to request new house schemas to be added
CREATE TABLE IF NOT EXISTS schema_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  builder_name TEXT NOT NULL,
  house_type TEXT NOT NULL,
  development_name TEXT,
  postcode TEXT,
  user_email TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema Problem Reports Table
-- For users to report issues with existing schemas
CREATE TABLE IF NOT EXISTS schema_problem_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schema_id UUID REFERENCES schemas(id) ON DELETE SET NULL,
  builder_name TEXT NOT NULL,
  house_type TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  user_email TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events Table
-- For tracking user interactions and events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter mailing_list table to add source column
ALTER TABLE mailing_list
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schema_requests_status ON schema_requests(status);
CREATE INDEX IF NOT EXISTS idx_schema_requests_created_at ON schema_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_problem_reports_status ON schema_problem_reports(status);
CREATE INDEX IF NOT EXISTS idx_schema_problem_reports_schema_id ON schema_problem_reports(schema_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_source ON mailing_list(source);

-- Enable Row Level Security
ALTER TABLE schema_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_problem_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schema_requests (public insert, admin read)
CREATE POLICY "Anyone can submit schema requests" ON schema_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view schema requests" ON schema_requests
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for schema_problem_reports (public insert, admin read)
CREATE POLICY "Anyone can report schema problems" ON schema_problem_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view problem reports" ON schema_problem_reports
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for analytics_events (public insert, admin read)
CREATE POLICY "Anyone can create analytics events" ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view analytics" ON analytics_events
  FOR SELECT TO authenticated
  USING (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_schema_requests_updated_at
  BEFORE UPDATE ON schema_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schema_problem_reports_updated_at
  BEFORE UPDATE ON schema_problem_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
