import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		console.log('signup');
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) {
			console.error(error);
			return fail(400, { error: error.message });
		} else {
			console.log(data);

			return { success: true };
		}
	},
	signin: async ({ request, locals: { supabase } }) => {
		console.log('signin');

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error(error);
			return fail(400, { email, missing: true, error: error.message });
		} else {
			return { success: true };
		}
	}
};
