/* eslint-disable no-prototype-builtins */
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		// console.log('signup');
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const captchaEnabled = formData.get('captchaEnabled');

		if (captchaEnabled === 'true') {
			const captchaToken = formData.get('cf-turnstile-response') as string;
			return fail(400, {
				errorType: 'fail',
				error: 'captchaToken: ' + captchaToken
			});
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { captchaToken }
			});

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
		} else {
			const { data, error } = await supabase.auth.signUp({ email, password });

			if (error) {
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
		}
	},
	signin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const captchaEnabled = formData.get('captchaEnabled');

		if (captchaEnabled === 'true') {
			const captchaToken = formData.get('cf-turnstile-response') as string;

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
