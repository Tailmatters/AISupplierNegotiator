-- Widget types table
CREATE TABLE IF NOT EXISTS widget_types (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_height INTEGER NOT NULL DEFAULT 2,
  default_width INTEGER NOT NULL DEFAULT 2,
  min_height INTEGER NOT NULL DEFAULT 1,
  min_width INTEGER NOT NULL DEFAULT 1,
  max_height INTEGER,
  max_width INTEGER,
  category TEXT NOT NULL DEFAULT 'general',
  available_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  layout JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Dashboard widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type_id INTEGER NOT NULL REFERENCES widget_types(id),
  title TEXT,
  settings JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 2,
  height INTEGER NOT NULL DEFAULT 2,
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default widget types
INSERT INTO widget_types 
  (type, name, description, icon, category, available_settings)
VALUES
  ('recent-negotiations', 'Recent Negotiations', 'Shows your most recent negotiations', 'file-text', 'negotiations', '{"limit": {"type": "number", "default": 5, "min": 1, "max": 20}}'),
  ('pending-contracts', 'Pending Contracts', 'Displays contracts that need your attention', 'clipboard-signature', 'contracts', '{"status": {"type": "select", "options": ["draft", "pending", "approved"], "default": "draft"}}'),
  ('active-suppliers', 'Active Suppliers', 'Shows your most active suppliers', 'users', 'suppliers', '{"limit": {"type": "number", "default": 5, "min": 1, "max": 20}, "category": {"type": "text"}}'),
  ('spend-by-category', 'Spend by Category', 'Displays spending breakdown by category', 'pie-chart', 'spend', '{"period": {"type": "select", "options": ["month", "quarter", "year", "all"], "default": "year"}}'),
  ('spend-by-supplier', 'Spend by Supplier', 'Shows top suppliers by spend', 'bar-chart-2', 'spend', '{"limit": {"type": "number", "default": 5, "min": 1, "max": 20}, "period": {"type": "select", "options": ["month", "quarter", "year", "all"], "default": "year"}}'),
  ('savings-tracker', 'Savings Tracker', 'Tracks savings from completed negotiations', 'trending-up', 'analytics', '{"period": {"type": "select", "options": ["month", "quarter", "year", "all"], "default": "year"}}'),
  ('upcoming-renewals', 'Upcoming Renewals', 'Shows contracts nearing renewal', 'calendar', 'contracts', '{"timeframe": {"type": "select", "options": ["week", "month", "quarter"], "default": "month"}}'),
  ('negotiation-outcomes', 'Negotiation Outcomes', 'Displays success rates of negotiations', 'activity', 'analytics', '{"period": {"type": "select", "options": ["month", "quarter", "year", "all"], "default": "year"}}'),
  ('category-summary', 'Category Summary', 'Detailed view of a specific category', 'folder', 'analytics', '{"category": {"type": "text", "required": true}}'),
  ('quick-actions', 'Quick Actions', 'Quick access to common actions', 'command', 'utilities', '{"actions": {"type": "multiselect", "options": ["new-negotiation", "new-supplier", "upload-contract", "upload-spend"], "default": ["new-negotiation", "new-supplier"]}}')
ON CONFLICT (type) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  available_settings = EXCLUDED.available_settings;