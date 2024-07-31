<script lang="ts">
	import Icon from '@iconify/svelte';
	// Forms
	import type { ActionResult } from '@sveltejs/kit';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	const phrase: string = 'DELETE THIS ACCOUNT';
	let confirm: string = '';
	let loading: boolean = false;

	const deleteUser = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		loading = true;

		if (confirm.trim() !== phrase) {
			const toast: ToastSettings = {
				message: 'You need to type exactly "' + phrase + '" in all caps to delete your account.',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
			loading = false;
			return;
		}

		// delete user

		const data = new FormData(event.currentTarget);

		const response = await fetch('?/deleteUser', {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			const toast: ToastSettings = {
				message: 'Deleted your account successfully.',
				background: 'variant-filled-success',
				timeout: 5000
			};
			toastStore.trigger(toast);
			loading = false;

			// rerun all `load` functions, following the successful update
			await invalidateAll();
			goto('/');
		} else if (result.type === 'failure') {
			console.log('result.data', result.data);
			const toast: ToastSettings = {
				message:
					'There was a problem deleting your account: <strong> ' + result.data?.error + '</strong>',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
			loading = false;

			await invalidateAll();
		}
		applyAction(result);
		loading = false;
	};
</script>

<div class="mt-8 flex flex-col items-center">
	<div class="rounded-md bg-tertiary-500 p-2 text-center text-white">
		<p>Are you sure you want to delete your account?</p>
		<p>
			If so, type "<span class="font-semibold text-black">{phrase}</span>" in all caps below.
		</p>
	</div>
	<div class="flex w-full flex-col items-center">
		<form
			method="POST"
			class="w-full text-primary-500 lg:w-1/3"
			on:submit|preventDefault={deleteUser}
		>
			<input
				type="text"
				name="confirm"
				id="confirm"
				class="input my-3 p-2 font-semibold text-black"
				bind:value={confirm}
			/>
			<div class=" flex flex-col items-center">
				<div class="flex flex-row items-center">
					<div class="mx-auto flex-auto">
						<a href="/user">
							<div class="variant-filled-tertiary btn btn-sm flex">No</div>
						</a>
					</div>
					<div class="mx-2 flex-auto">or</div>
					<div class="mx-auto flex-auto">
						<button class="variant-filled-tertiary btn btn-sm flex" type="submit">
							Delete My Account</button
						>
					</div>
					<div class="mx-2 flex">
						{#if !loading}
							<Icon
								icon="ic:baseline-lock"
								width="1.2em"
								height="1.2em"
								class="text-tertiary-500"
							/>
						{:else}
							<Icon
								icon="line-md:loading-loop"
								width="2em"
								height="2em"
								class="text-tertiary-500"
							/>
						{/if}
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
