export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'rich-text' 
  | 'number' 
  | 'boolean' 
  | 'file' 
  | 'date' 
  | 'email' 
  | 'url' 
  | 'select' 
  | 'json' 
  | 'tags' // Array of strings (stored as JSON)
  | 'text-tags' // Array of strings in UI, comma-separated string in DB
  | 'title-desc-array' // Array of {title, desc} objects
  | 'color';

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  options?: string[]; // For select inputs
  required?: boolean;
  description?: string;
  readOnly?: boolean; // If true, field is disabled in form
  section?: string; // Header to group fields visually
  hidden?: boolean; // If true, field is hidden from UI (Form & List) but still processed
  // Allow fields to be visually in this collection but stored in another (e.g. settings UI -> profile DB)
  externalStorage?: {
    collection: string;
    id: string;
  };
}

export interface CollectionSchema {
  id: string;
  name: string;
  type: 'single' | 'list'; // 'single' means we only edit the first record or create one if missing
  category?: string; // Grouping for sidebar (e.g., 'System', 'Content')
  fields: FieldDefinition[];
  icon: string; // Lucide icon name for the sidebar
  previewField?: string; // Field to show in list view
  
  // Business Logic Configs
  maxItems?: number; // Limit number of records (e.g. 3 or 4)
  preventCreate?: boolean; // If true, hide create button (e.g. for Messages)
  fixedSlugs?: string[]; // For collections like Legals where we want specific pre-defined records
  
  // ID Generation
  singletonId?: string; // Force a specific ID for single types (e.g. 'settings')
  idPrefix?: string; // Force sequential IDs for lists (e.g. 'project-')
}

// PocketBase Record Types (Generic)
export interface PbRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  [key: string]: any;
}