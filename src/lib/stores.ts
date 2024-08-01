import { readable, writable } from 'svelte/store';

export const siteSettingsServer = {
	appName: 'Sleestack 2',
	version: '2.0.0',
	useCaptcha: true
};

// Create a readable store with the static value
export const siteSettingsClient = readable(siteSettingsServer);

export const derivedUserName = writable('');
