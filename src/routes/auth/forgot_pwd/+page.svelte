<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';

	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let data;
	$: ({ supabase } = data);

	let loading: boolean = false;
	let email: string = '';

	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	async function SendResetPwdEmail() {
		loading = true;

		if (email) {
			let validEmail = isValidEmail(email);
			if (!validEmail) {
				const toast: ToastSettings = {
					message: 'Please enter a valid email address.',
					background: 'variant-filled-error',
					timeout: 5000
				};
				toastStore.trigger(toast);
				loading = false;
				return;
			}
			const { data, error } = await supabase.auth.resetPasswordForEmail(email);
			// toast and redirect
			if (error) {
				const toast: ToastSettings = {
					message: error.message,
					background: 'variant-filled-error',
					timeout: 5000
				};
				toastStore.trigger(toast);
			} else {
				const toast: ToastSettings = {
					message:
						'Reset password email sent.<br /> If you do not receive the email, please check your spam folder.',
					background: 'variant-filled-success',
					timeout: 5000
				};
				toastStore.trigger(toast);
				goto('/auth');
			}
		}
		loading = false;
	}
</script>

<form on:submit={SendResetPwdEmail}>
	<div class="mt-20 flex w-full flex-col items-center">
		<div class="w-2/3">
			<input
				name="email"
				type="email"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				placeholder="Please type the email address to send the reset link ...."
				bind:value={email}
			/>
		</div>
		<div class="mt-4 w-2/3 text-center">
			{#if loading}
				<Icon icon="line-md:loading-loop" width="2em" height="2em" class="text-tertiary-500" />
			{:else}
				<button class="variant-filled-tertiary btn" type="submit">Send reset password email</button>
			{/if}
		</div>
	</div>
</form>
