/* eslint-disable no-prototype-builtins */
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PRIVATE_TURNSTILE_SECRET_KEY } from '$env/static/private';

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
		const captchaEnabled = formData.get('captchaEnabled');

		// console.log('captchaEnabled:', captchaEnabled);

		if (captchaEnabled === 'true') {
			const captchaToken = formData.get('cf-turnstile-response') as string;
			console.log('captchaToken:', captchaToken);

			const { success, errors } = await validateToken(captchaToken, PRIVATE_TURNSTILE_SECRET_KEY);

			if (errors) {
				return fail(400, { captchaToken, error: 'Failed CAPTCHA' });
			} else {
				console.log('CAPTCHA success', success);
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
					options: { captchaToken }
				});
				if (error) {
					console.error(error);
					return fail(400, { email, error: error.message });
				} else {
					return { success: true };
				}
			}
		} else {
			// log in without Captcha
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) {
				console.error(error);
				return fail(400, { email, error: error.message });
			} else {
				return { success: true };
			}
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
