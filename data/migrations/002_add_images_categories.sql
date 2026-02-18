CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO categories (name, slug, color) VALUES 
('Research Report', 'research-report', '#059669'),
('Case Study', 'case-study', '#dc2626'),
('Tutorial', 'tutorial', '#7c3aed'),
('Industry News', 'industry-news', '#ea580c'),
('Best Practices', 'best-practices', '#0891b2');
