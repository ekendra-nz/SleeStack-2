/* eslint-disable no-prototype-builtins */
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PRIVATE_TURNSTILE_SECRET_KEY } from '$env/static/private';
import { errors } from '@playwright/test';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		// console.log('signup');
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) {
			console.error(error);
			return fail(400, {
				errorType: 'fail',
				error:
					'There was a problem sending a verification email to <strong>' +
					email +
					'</strong>. <br />It could be something on our end, but please double check your email address and try again. <br />' +
					error.message
			});
		} else {
			// console.log(data);
			if (
				data.user?.user_metadata?.email_verified === true ||
				data.user?.user_metadata?.email_verified == 'undefined' ||
				!data.user?.user_metadata?.hasOwnProperty('email_verified')
			) {
				return fail(400, {
					errorType: 'exists',
					error: 'User already exists. Did you forget your password?'
				});
			}

			return { success: true };
		}
	},
	signin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const token = formData.get('cf-turnstile-response');
		console.log('token:', token);
		const SECRET_KEY = PRIVATE_TURNSTILE_SECRET_KEY;

		const { success, errors } = await validateToken(token, SECRET_KEY);

		if (errors) {
			return fail(400, { token, error: 'Failed CAPTCHA' });
		} else {
			console.log('CAPTCHA success', success);
		}
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error(error);
			return fail(400, { email, error: error.message });
		} else {
			return { success: true };
		}
	}
};

interface TokenValidateResponse {
	'error-codes': string[];
	success: boolean;
	action: string;
	cdata: string;
}

async function validateToken(token: string, secret: string) {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			response: token,
			secret: secret
		})
	});

	const data: TokenValidateResponse = await response.json();

	return {
		// Return the status
		success: data.success,

		// Return the first error if it exists
		errors: data['error-codes']?.length ? data['error-codes'][0] : null
	};
}
