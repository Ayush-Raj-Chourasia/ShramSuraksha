-- COPY AND PASTE THIS ENTIRE SNIPPET INTO SUPABASE SQL EDITOR --
-- Found at: https://supabase.com/dashboard/project/zjfjvzejndkgjqcfcajz/sql/new

CREATE TABLE workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  platform text NOT NULL,
  city text NOT NULL,
  zone text,
  "gpsLat" float,
  "gpsLng" float,
  "riskScore" integer DEFAULT 25,
  "totalEarningsProtected" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" text NOT NULL, -- Storing the worker UUID as text to match JS
  plan text NOT NULL,
  status text DEFAULT 'active',
  "weeklyPremium" integer NOT NULL,
  "dailyCoverage" integer NOT NULL,
  "weeklyCoverage" integer NOT NULL,
  "startDate" timestamp with time zone DEFAULT now(),
  "endDate" timestamp with time zone,
  "autoRenew" boolean DEFAULT true,
  "aiRecommended" boolean DEFAULT false,
  "aiPremium" integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" text NOT NULL,
  "policyId" text NOT NULL,
  "triggerType" text NOT NULL,
  "triggerData" jsonb DEFAULT '{}'::jsonb,
  location jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  "payoutAmount" integer DEFAULT 0,
  "settleTime" integer,
  "fraudScore" float DEFAULT 0,
  "fraudFlag" boolean DEFAULT false,
  "fraudReasons" jsonb DEFAULT '[]'::jsonb,
  "paymentRef" text,
  "paymentMethod" text DEFAULT 'UPI',
  "verifiedGPS" boolean DEFAULT true,
  "wasWorking" boolean DEFAULT true,
  "settledAt" timestamp with time zone,
  "userName" text,
  "userPlatform" text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  severity text DEFAULT 'high',
  zone text,
  city text,
  "triggerValue" float,
  threshold float,
  "payoutTriggered" boolean DEFAULT false,
  "payoutAmount" integer DEFAULT 0,
  "workersAffected" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
