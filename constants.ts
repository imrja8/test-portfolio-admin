import { CollectionSchema } from './types';

// --- ICON SUBSETS ---
// Specific icon lists curated for different collection contexts

export const SKILL_ICONS = [
  // Tech
  'Code', 'Brain', 'Server', 'Layout', 'Database', 'Cloud', 'Terminal', 
  'GitBranch', 'Container', 'Bot', 'Smartphone', 'Monitor',
  // Design
  'Palette', 'PenTool', 'Image', 'Sparkles', 'Grid'
];

export const ACHIEVEMENT_ICONS = [
  'Trophy', 'Award', 'Medal', 'Crown', 'Star', 'GraduationCap', 'ThumbsUp', 'CheckCircle'
];

export const SHOWCASE_ICONS = [
  'TrendingUp', 'Target', 'Zap', 'Users', 'Briefcase', 'Clock', 'Calendar', 
  'Globe', 'Flag', 'Rocket', 'FileCode'
];

export const ACTION_ICONS = [
  'Zap', 'Rocket', 'Star', 'Lightbulb', 'Link', 'Flag', 'ThumbsUp'
];

// NOTE: PocketBase IDs must be exactly 15 characters long and lowercase alphanumeric (a-z0-9).
// We pad these values in the UI to meet that requirement.

export const COLLECTIONS: CollectionSchema[] = [
  // --- SYSTEM & PROFILE ---
  {
    id: 'settings',
    name: 'System Settings',
    type: 'single',
    category: 'System',
    icon: 'Settings',
    singletonId: 'settings0000000', // 15 chars
    fields: [
      // General Section
      { name: 'homepage_title', label: 'Homepage Title', type: 'text', required: true, section: 'General Information' },
      
      // Fields visually here but stored in Profile
      { 
        name: 'tagline', 
        label: 'Homepage Tagline', 
        type: 'text', 
        section: 'General Information',
        externalStorage: { collection: 'profile', id: 'profile00000000' }
      },
      { 
        name: 'about_text', 
        label: 'About Page Tagline', 
        type: 'text', 
        section: 'General Information',
        externalStorage: { collection: 'profile', id: 'profile00000000' }
      },
      
      { name: 'seo_description', label: 'Meta Description', type: 'textarea', section: 'General Information' },
      
      // SEO Section
      { name: 'seo_keywords', label: 'SEO Keywords', type: 'text-tags', section: 'SEO & Social Media' },
      { name: 'seo_author', label: 'SEO Author', type: 'text', section: 'SEO & Social Media' },
      { name: 'og_title', label: 'OG Title', type: 'text', section: 'SEO & Social Media' },
      { name: 'og_description', label: 'OG Description', type: 'textarea', section: 'SEO & Social Media' },
      { name: 'og_image', label: 'OG Image', type: 'file', section: 'SEO & Social Media' },
      { name: 'favicon', label: 'Favicon', type: 'file', section: 'SEO & Social Media' },

      // Theme Section
      { name: 'primary_color', label: 'Theme Colour', type: 'color', section: 'Theme & Management' },
      
      // Moved from Profile
      { 
        name: 'footerText', 
        label: 'Footer Developer Text', 
        type: 'text', 
        section: 'Theme & Management',
        externalStorage: { collection: 'profile', id: 'profile00000000' }
      },
      
      { name: 'isLive', label: 'Is Live', type: 'boolean', section: 'Theme & Management' },
      { name: 'analytics', label: 'Google Analytics ID', type: 'text', section: 'Theme & Management', description: 'Measurement ID (e.g. G-XXXXXXXXXX)' }
    ]
  },
  {
    id: 'profile',
    name: 'Portfolio Profile',
    type: 'single',
    category: 'System',
    icon: 'User',
    singletonId: 'profile00000000', // 15 chars
    fields: [
      // Personal Information
      { name: 'firstName', label: 'First Name', type: 'text', section: 'Personal Information' },
      { name: 'lastName', label: 'Last Name', type: 'text', section: 'Personal Information' },
      { name: 'avatar', label: 'Avatar/Profile', type: 'file', section: 'Personal Information' },

      // Bio & Content
      { name: 'aboutBio', label: 'About Bio', type: 'rich-text', section: 'Bio & Content' },

      // Social Profile Links
      { name: 'githubUrl', label: 'GitHub URL', type: 'url', section: 'Social Profile Links' },
      { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', section: 'Social Profile Links' },
      { name: 'leetcodeUrl', label: 'LeetCode URL', type: 'url', section: 'Social Profile Links' },

      // Documents
      { name: 'resume', label: 'Attach Documents', type: 'file', section: 'Documents' },
      { name: 'button', label: 'Document Button Text', type: 'text', section: 'Documents' }
    ]
  },
  {
    id: 'action',
    name: 'Call to Action',
    type: 'single',
    category: 'System',
    icon: 'Zap',
    singletonId: 'cta000000000000', // 15 chars
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'subheading', label: 'Subheading', type: 'text' },
      { name: 'button', label: 'Button Label', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'select', options: ACTION_ICONS, description: 'Select an CTA icon' }
    ]
  },

  // --- CONTENT MANAGEMENT ---
  {
    id: 'projects',
    name: 'Projects',
    type: 'list',
    category: 'Content',
    icon: 'Briefcase',
    previewField: 'title',
    idPrefix: 'project', // Will become project00000001
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Project Image', type: 'file' },
      { name: 'techStack', label: 'Tech Stack', type: 'tags', description: 'Press Enter to add tags' },
      { name: 'challenge', label: 'Challenge', type: 'textarea' },
      { name: 'solution', label: 'Solution', type: 'textarea' },
      { name: 'keyFeatures', label: 'Key Features', type: 'tags' },
      { name: 'outcome', label: 'Outcome', type: 'textarea' },
      { name: 'liveUrl', label: 'Live URL', type: 'url' },
      { name: 'repoUrl', label: 'Repo URL', type: 'url' },
      { name: 'modules', label: 'Modules', type: 'title-desc-array', description: 'Add structured modules for this project' }
    ]
  },
  {
    id: 'taglines',
    name: 'Taglines',
    type: 'list',
    category: 'Content',
    icon: 'Type',
    previewField: 'line1',
    idPrefix: 'tagline',
    fields: [
      { name: 'line1', label: 'Line 1', type: 'text' },
      { name: 'line2', label: 'Line 2', type: 'text' }
    ]
  },
  {
    id: 'skills',
    name: 'Skills',
    type: 'list',
    category: 'Content',
    icon: 'Cpu',
    previewField: 'title',
    idPrefix: 'skill',
    fields: [
      { name: 'title', label: 'Skill Title', type: 'text' },
      { name: 'desc', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'select', options: SKILL_ICONS, description: 'Select an skills icon' },
      { name: 'isFeatured', label: 'Featured?', type: 'boolean' }
    ]
  },
  {
    id: 'tools',
    name: 'Tools',
    type: 'list',
    category: 'Content',
    icon: 'Tool',
    previewField: 'name',
    idPrefix: 'tool',
    fields: [
      { name: 'name', label: 'Tool Name', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'file' }
    ]
  },
  {
    id: 'certifications',
    name: 'Certifications',
    type: 'list',
    category: 'Content',
    icon: 'Award',
    previewField: 'name',
    idPrefix: 'cert',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'link', label: 'Certificate Link', type: 'url' }
    ]
  },
  {
    id: 'achievements',
    name: 'Achievements',
    type: 'list',
    category: 'Content',
    icon: 'Star',
    previewField: 'title',
    idPrefix: 'achieve',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'select', options: ACHIEVEMENT_ICONS, description: 'Select an achievement icon' }
    ]
  },
  {
    id: 'keywords',
    name: 'Marquee Keywords',
    type: 'list',
    category: 'Content',
    icon: 'Hash',
    previewField: 'text',
    idPrefix: 'keyword',
    fields: [
      { name: 'text', label: 'Keyword', type: 'text' }
    ]
  },
  {
    id: 'faqs',
    name: 'FAQs',
    type: 'list',
    category: 'Content',
    icon: 'HelpCircle',
    previewField: 'question',
    idPrefix: 'faq',
    fields: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'answer', label: 'Answer', type: 'textarea' }
    ]
  },

  // --- SITE STRUCTURE / LIMITED ---
  {
    id: 'legals',
    name: 'Legal Pages',
    type: 'list',
    category: 'Pages',
    icon: 'Shield',
    previewField: 'slug',
    fixedSlugs: ['privacy-policy', 'terms-of-use'],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text', description: 'System identifier', required: true, readOnly: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'content', label: 'Content', type: 'rich-text' },
      { name: 'last_updated', label: 'Last Updated', type: 'text' }
    ]
  },
  {
    id: 'showcase',
    name: 'Showcase',
    type: 'list',
    category: 'Pages',
    icon: 'Monitor',
    previewField: 'label',
    fixedSlugs: ['stat-1', 'stat-2', 'stat-3', 'stat-4'],
    fields: [
      { name: 'slug', label: 'Slot ID', type: 'text', required: true, readOnly: true, hidden: true },
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'select', options: SHOWCASE_ICONS, description: 'Select a stat/metric icon' }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    type: 'list',
    category: 'Pages',
    icon: 'BookOpen',
    previewField: 'degree',
    fixedSlugs: ['education-1', 'education-2', 'education-3'],
    fields: [
      { name: 'slug', label: 'Slot ID', type: 'text', required: true, readOnly: true, hidden: true },
      { name: 'degree', label: 'Degree', type: 'text' },
      { name: 'institution', label: 'Institution', type: 'text' },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' }
    ]
  },

  // --- INBOX ---
  {
    id: 'messages',
    name: 'Messages',
    type: 'list',
    category: 'Inbox',
    icon: 'MessageSquare',
    previewField: 'subject',
    preventCreate: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', readOnly: true },
      { name: 'email', label: 'Email', type: 'email', readOnly: true },
      { name: 'phone', label: 'Phone', type: 'text', readOnly: true },
      { name: 'subject', label: 'Subject', type: 'text', readOnly: true },
      { name: 'message', label: 'Message', type: 'textarea', readOnly: true }
    ]
  }
];