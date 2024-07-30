<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { EventHandler } from 'svelte/elements';
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ notes, supabase, user } = data);

	let pwdLoading: boolean = false;
	let noteLoading: boolean = false;

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

	let handleSubmit: EventHandler<SubmitEvent, HTMLFormElement>;
	$: handleSubmit = async (evt) => {
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
</script>

<h1 class="h1">User page for: {user?.email}</h1>

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
	<form on:submit={handleSubmit}>
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
					<button type="submit" class="variant-filled-tertiary rounded px-4 py-2">
						Add Note
					</button>
				{/if}
			</div>
		</div>
	</form>
</div>

<div class="grid grid-cols-3">
	<div class="bg-filled-surface"></div>
	<div class="rounded-lg border border-secondary-600 bg-primary-500 px-16 py-2 text-secondary-500">
		<h2 class="h2 mb-2 text-center underline">Notes</h2>

		<ul class=" list-disc">
			{#each notes as note}
				<li>{note.note}</li>
			{/each}
		</ul>
	</div>
	<div class="bg-filled-surface"></div>
</div>
