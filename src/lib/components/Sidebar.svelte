<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';

	export let data;
	$: ({ supabase } = data);

	$: signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			invalidateAll;
			drawerStore.close();
			goto('/');
		}
	};

	const drawerStore = getDrawerStore();

	const drawerClose = () => {
		drawerStore.close();
	};
</script>

<aside class="w-full">
	<nav>
		<ul>
			<li>
				<a href="/user" class="block px-3 py-2 hover:bg-secondary-700" on:click={drawerClose}
					>Account Details</a
				>
			</li>
			<li>
				<a href="/user" class="block px-3 py-2 hover:bg-secondary-700" on:click={drawerClose}
					>Second User Page</a
				>
			</li>
			<li>
				<a href="/user" class="block px-3 py-2 hover:bg-secondary-700" on:click={drawerClose}
					>Third User Page</a
				>
			</li>
			<!-- on:click={signOut} -->
			<li>
				<a href="/user" class="block px-3 py-2 hover:bg-secondary-700" on:click={signOut}
					>Sign Out</a
				>
			</li>
		</ul>
	</nav>
</aside>
