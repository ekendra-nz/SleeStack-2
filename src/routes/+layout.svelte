<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Toast } from '@skeletonlabs/skeleton';

	initializeStores();

	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		// console.log('session?.user: ', session?.user);

		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<Toast />

<!-- <AppShell>...</AppShell> -->
<div class="min-h-screen">
	<div class="flex min-h-screen flex-col">
		<!-- Header  -->
		<Nav {data} />
		<!-- Container  -->
		<div class="flex flex-1">
			<!-- Right Sidebar. -->
			<Drawer><Sidebar {data} /></Drawer>
			<!-- Main Content -->
			<main class="flex-1 space-y-4 p-4">
				<slot></slot>
			</main>
		</div>
	</div>
</div>
