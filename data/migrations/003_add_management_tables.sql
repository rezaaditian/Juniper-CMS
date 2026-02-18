CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO services (title, slug, description, content, order_index) VALUES 
('Proposal Management', 'proposal-management', 'Comprehensive proposal management services tailored to organizations of all sizes and maturity levels.', 'With over 15 years of experience supporting clients in the public and private sectors, I offer comprehensive proposal management services tailored to organizations of all sizes and maturity levels. My approach emphasizes compliance, clarity, and competitiveness, ensuring every submission is strategically positioned for success.', 1),
('Proposal Coordination', 'proposal-coordination', 'Seamless coordination keeping every piece of the process moving with precision and clarity.', 'Efficient proposal development hinges on seamless coordination, and thats where we step in. We offer proposal coordination services designed to keep every piece of the process moving with precision and clarity, enabling proposal managers and teams to focus on strategy and content quality.', 2);

INSERT OR IGNORE INTO testimonials (name, title, company, content, featured) VALUES
('Business Development Account Executive', 'Account Executive', 'Fortune 500 Company', 'Tia is simply the most efficient, professional, productive, bright, and enthusiastic proposal manager I have ever worked with. In our business, the ability to create detailed, informative, and compelling responses to RFP/RFI''s is critical to winning new business. Nothing is ever too much trouble for Tia; her dedication to supporting the process meant she was willing to work long hours and go well above and beyond the call of duty. The quality of Tia''s output is first-class, and she consistently demonstrates a strong ability to quickly understand the context of the projects we are proposing, which further aids the process. I have no hesitation in recommending Tia.', 1);

INSERT OR IGNORE INTO contact_info (key, value, label, type) VALUES 
('email', 'hello@juniperproposals.com', 'Email', 'email'),
('phone', '(555) 123-4567', 'Phone', 'tel'),
('location', 'Nationwide Service', 'Location', 'text'),
('hero_title', 'Proposal Management', 'Hero Title', 'text'),
('hero_subtitle', 'Creating winning proposals that deliver exceptional results.', 'Hero Subtitle', 'textarea'),
('contact_title', 'Lets work together', 'Contact Section Title', 'text'),
('contact_description', 'Ready to win your next proposal? Contact us today to get started with professional proposal management services.', 'Contact Description', 'textarea');
