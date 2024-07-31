import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, locals: { supabase, user } }) => {
	depends('supabase:db:profiles');
	const { data: profile } = await supabase
		.from('profiles')
		.select('first_name,last_name')
		.eq('user_id', user?.id);

	if (profile) {
		return { profile: profile[0] };
	}
};
