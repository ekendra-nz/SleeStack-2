<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let data;
	$: ({ supabase } = data);
	$: ({ session } = data);

	$: signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
			const toast: ToastSettings = {
				message: 'There was a problem signing you out.',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
		} else {
			const toast: ToastSettings = {
				message: 'Signed out.',
				background: 'variant-filled-success',
				timeout: 5000
			};
			toastStore.trigger(toast);
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
			<li class="block bg-secondary-700 px-3 py-2">
				<p>Details for: {session?.user?.email}</p>
			</li>
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
