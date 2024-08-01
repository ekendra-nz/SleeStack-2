import { readable, writable } from 'svelte/store';

export const siteSettingsServer = {
	appName: 'Sleestack 2',
	version: '2.0.0',
	useCaptcha: true // must also switch on/off captcha bot protection in Supabase (Settings > Authentication):
	// https://supabase.com/dashboard/project/mhcgkcjyoqigqhvzvzfw/settings/auth
};

// Create a readable store with the static value
export const siteSettingsClient = readable(siteSettingsServer);

export const derivedUserName = writable('');
