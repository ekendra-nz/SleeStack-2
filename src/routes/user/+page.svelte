<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { EventHandler } from 'svelte/elements';
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ notes, profile, supabase, user } = data);

	let pwdLoading: boolean = false;
	let noteLoading: boolean = false;
	let userDetailsLoading: boolean = false;
	let first_name: any = '';
	let last_name: string = '';

	onMount(() => {
		first_name = profile?.first_name;
		last_name = profile?.last_name;
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
			.update({ first_name: first_name, last_name: last_name })
			.eq('user_id', user?.id)
			.select();
		// const { data, error } = await supabase
		// 	.from('profiles')
		// 	.insert([
		// 		{ user_id: user?.id, email: user?.email, first_name: first_name, last_name: last_name }
		// 	])
		// 	.select();

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
			}
		}
		userDetailsLoading = false;
		invalidate('supabase:db:profiles');
		// form.reset();
	};

	let handleNotesSubmit: EventHandler<SubmitEvent, HTMLFormElement>;
	$: handleNotesSubmit = async (evt) => {
		noteLoading = true;
		evt.preventDefault();
		if (!evt.target) return;

		const form = evt.target as HTMLFormElement;

		const note = (new FormData(form).get('note') ?? '') as string;
		if (!note) {
			noteLoading = false;
			return;
		}

		const { error } = await supabase.from('notes').insert({ note });

		if (error) {
			console.error(error);
			const toast: ToastSettings = {
				message: error.message,
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
		} else {
			const toast: ToastSettings = {
				message: 'Note added successfully!',
				background: 'variant-filled-success',
				timeout: 2000
			};
			toastStore.trigger(toast);
		}
		noteLoading = false;
		invalidate('supabase:db:notes');
		form.reset();
	};

	async function SendResetPwdEmail() {
		let email: string | undefined = user?.email;

		if (email) {
			pwdLoading = true;
			const { data, error } = await supabase.auth.resetPasswordForEmail(email);
			if (error) {
				const toast: ToastSettings = {
					message: error.message,
					background: 'variant-filled-error',
					timeout: 5000
				};
				toastStore.trigger(toast);
			} else {
				const toast: ToastSettings = {
					message: 'Reset password email sent',
					background: 'variant-filled-success',
					timeout: 5000
				};
				toastStore.trigger(toast);
			}
			pwdLoading = false;
		}
	}
</script>

<h3 class="h3">User page for: {user?.email}</h3>
<div class="container rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500">
	<div>
		<form on:submit|preventDefault={handleUserDetailsSubmit}>
			<p class="mb-2">You can change your details here:</p>
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

<div
	class="container grid-cols-4 gap-4 rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500 md:grid-cols-1"
>
	<div>
		<p>
			This page is protected from non-authorised users and the notes below come from a table in the
			database that only allows authenticated users access to their own entries. (It is wiped out
			every day.)
		</p>
	</div>
	<form on:submit={handleNotesSubmit}>
		<div class="mt-1 flex w-full">
			<div class="grow">
				<input
					class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
					name="note"
					type="text"
					placeholder="Add a note ..."
				/>
			</div>

			<div class="ml-2 flex items-center justify-center">
				{#if noteLoading}
					<Icon icon="line-md:loading-loop" width="2em" height="2em" class="text-tertiary-500" />
				{:else}
					<button type="submit" class="variant-filled-tertiary rounded px-4 py-2"> Add </button>
				{/if}
			</div>
		</div>
	</form>
</div>

<div
	class="first-letter: flex rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500"
>
	<div class=" px-16 py-2">
		<h2 class="h2 mb-2 text-left underline">Notes</h2>

		<ul class=" list-disc">
			{#each notes as note}
				<li>{note.note}</li>
			{/each}
		</ul>
	</div>
</div>
<div class="mt-8 flex flex-col items-center">
	<div class="flex flex-1 items-center">
		<button class="variant-filled-tertiary btn btn-sm mx-3 flex" on:click={SendResetPwdEmail}
			>Send me a "reset password" email</button
		>
		<div class="flex flex-1">
			{#if !pwdLoading}
				<Icon icon="ic:baseline-lock" width="1.2em" height="1.2em" class="text-tertiary-500" />
			{:else}
				<Icon icon="line-md:loading-loop" width="2em" height="2em" class="text-tertiary-500" />
			{/if}
		</div>
	</div>
</div>
<div class="flex flex-col items-center">
	<div class="flex">
		<a href="/auth/delete">
			<button class="variant-filled-tertiary btn btn-sm mx-3 flex">Delete this account</button>
		</a>
	</div>
</div>
