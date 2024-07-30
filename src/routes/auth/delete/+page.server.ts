import { PRIVATE_SUPABASE_SERVICE_ROLE } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	deleteUser: async ({ locals: { supabase } }) => {
		// deleteUser: async () => {
		console.log('delete user from server');
		const user_id: string | undefined = await getUserID({ locals: { supabase } });

		const adminSupabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE);

		if (user_id === undefined) {
			return fail(400, {
				errorType: 'fail',
				error: 'There was a problem deleting your account: <br />' + 'User ID not found'
			});
		} else {
			const { error } = await adminSupabase.auth.admin.deleteUser(user_id);
			if (error) {
				console.error(error);
				return fail(400, {
					errorType: 'fail',
					error: 'There was a problem deleting your account: <br />' + error.message
				});
			} else {
				return { success: true };
			}
		}
	}
};

import { SupabaseClient } from '@supabase/supabase-js';

const getUserID = async ({ locals: { supabase } }: { locals: { supabase: SupabaseClient } }) => {
	const { data } = await supabase.auth.getUser();

	return data.user?.id;
};
