<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	// toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ supabase, user } = data);

	let pwd: string = '';
	let pwd2: string = '';

	onMount(() => {
		console.log('user: ', user);
	});
	async function resetPwd() {
		if (pwd !== pwd2) {
			console.error('Passwords do not match');
			const t: ToastSettings = {
				message: 'Your passwords do not match.',
				background: 'variant-filled-error',
				timeout: 10000
			};
			toastStore.trigger(t);
			return;
		}
		const { error } = await supabase.auth.updateUser({ password: pwd });
		if (error) {
			console.error(error);
		} else {
			const t: ToastSettings = {
				message: 'Password reset successfully.',
				hideDismiss: true,
				background: 'variant-filled-success',
				timeout: 5000
			};
			toastStore.trigger(t);
		}
	}
</script>

<h1 class="h1">New password</h1>
<form on:submit={resetPwd}>
	<div class="mt-10 flex w-full flex-col items-center">
		<div>
			<p class="h3">Passwords need to contain:</p>
			<ul role="list" class="ml-4 list-disc space-y-1 pl-5 marker:text-tertiary-400">
				<li><span>At least 8 characters</span></li>
				<li>At least one uppercase letter</li>
				<li>At least one lowercase letter</li>
				<li>At least one number</li>
				<li>At least one special character</li>
			</ul>
		</div>
		<div class="sm:3/4 mt-4 w-1/2">
			<input
				name="password"
				type="password"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				placeholder="Please type a new password ..."
				bind:value={pwd}
			/>
		</div>
		<div class="sm:3/4 mt-4 w-1/2">
			<input
				name="password2"
				type="password"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				placeholder="Please confirm your password ..."
				bind:value={pwd2}
			/>
		</div>
		<div class="mt-4 w-2/3 text-center">
			<button class="variant-filled-tertiary btn" type="submit">Reset Password</button>
		</div>
	</div>
</form>
