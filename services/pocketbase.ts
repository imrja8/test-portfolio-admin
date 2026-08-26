import PocketBase, { BaseAuthStore } from 'pocketbase';

if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    throw new Error('NEXT_PUBLIC_POCKETBASE_URL is not defined');
}
export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

class CookieAuthStore extends BaseAuthStore {
    save(token: string, model: any) {
        super.save(token, model);
        if (typeof document !== 'undefined') {
            document.cookie = `pb_auth=${encodeURIComponent(JSON.stringify({ token, model }))}; path=/; max-age=31536000; SameSite=Lax; Secure`;
        }
    }

    clear() {
        super.clear();
        if (typeof document !== 'undefined') {
            document.cookie = `pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
    }
}

let initialAuth = { token: '', model: null };
if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )pb_auth=([^;]+)'));
    if (match) {
        try {
            initialAuth = JSON.parse(decodeURIComponent(match[2]));
        } catch (e) {}
    }
}

const customAuthStore = new CookieAuthStore();
if (initialAuth.token) {
    customAuthStore.save(initialAuth.token, initialAuth.model);
}

export const pb = new PocketBase(PB_URL, customAuthStore);

// Helper to get file URL
export const getFileUrl = (record: any, filename: string) => {
  if (!filename) return null;
  // Use getURL for SDK versions 0.23+
  return pb.files.getURL(record, filename);
};