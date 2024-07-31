<script lang="ts">
	import { goto, invalidate } from '$app/navigation';

	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ profile, supabase, user } = data);

	let userDetailsLoading: boolean = false;
	let first_name: any = '';
	let last_name: string = '';

	onMount(() => {
		first_name = profile?.first_name;
		last_name = profile?.last_name;
		const toast: ToastSettings = {
			message: 'Email address confirmed for: ' + user?.email,
			background: 'variant-filled-success',
			timeout: 5000
		};
		toastStore.trigger(toast);
	});

	$: handleUserDetailsSubmit = async () => {
		userDetailsLoading = true;

		if (!first_name) {
			userDetailsLoading = false;
			return;
		}
		if (!last_name) {
			userDetailsLoading = false;
			return;
		}

		const { data, error } = await supabase
			.from('profiles')
			.insert([
				{ user_id: user?.id, email: user?.email, first_name: first_name, last_name: last_name }
			])
			.select();

		if (error) {
			console.error(error);
			const toast: ToastSettings = {
				message: error.message,
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
		} else {
			// console.log('data', data);
			if (data.length === 0) {
				const toast: ToastSettings = {
					message: 'There was an error updating your details.',
					background: 'variant-filled-error',
					timeout: 2000
				};
				toastStore.trigger(toast);
			} else {
				const toast: ToastSettings = {
					message: 'User details updated successfully!',
					background: 'variant-filled-success',
					timeout: 2000
				};
				toastStore.trigger(toast);
				await goto('/user');
			}
		}
		userDetailsLoading = false;
		invalidate('supabase:db:profiles');
		// form.reset();
	};
</script>

<div class="flex flex-col items-center">
	<div class="flex rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500">
		<form on:submit|preventDefault={handleUserDetailsSubmit}>
			<p class="mb-2 rounded-md bg-secondary-50 p-2">
				Before we get started, let's get some details:
			</p>
			<label for="first_name">First Name</label>
			<input
				name="first_name"
				id="first_name"
				type="text"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				bind:value={first_name}
			/>
			<label for="last_name">Last Name</label>
			<input
				name="last_name"
				id="last_name"
				type="text"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				bind:value={last_name}
			/>
			<div class="mt-3 flex flex-col items-end">
				{#if !userDetailsLoading}
					<button class="variant-filled-tertiary btn btn-sm mx-3 flex">Save</button>
				{:else}
					<Icon icon="line-md:loading-loop" width="2em" height="2em" class="text-tertiary-500" />
				{/if}
			</div>
		</form>
	</div>
</div>
