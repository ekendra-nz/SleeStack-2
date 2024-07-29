<script lang="ts">
	import type { PageData } from './$types';
	// toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { goto, invalidateAll } from '$app/navigation';
	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ supabase, user } = data);

	let pwd: string = '';
	let pwd2: string = '';

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
				message: 'Password reset successfully. Please log in again.',
				hideDismiss: true,
				background: 'variant-filled-success',
				timeout: 5000
			};
			toastStore.trigger(t);
			invalidateAll();
			const { error } = await supabase.auth.signOut();
			goto('/auth');
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
				required
				bind:value={pwd}
			/>
		</div>
		<div class="sm:3/4 mt-4 w-1/2">
			<input
				name="password2"
				type="password"
				class="input p-2 font-extrabold text-primary-400 focus:bg-secondary-400 focus:outline-none"
				placeholder="Please confirm your password ..."
				required
				bind:value={pwd2}
			/>
		</div>
		<div class="mt-4 w-2/3 text-center">
			<button class="variant-filled-tertiary btn" type="submit">Reset Password</button>
		</div>
	</div>
</form>

<style>
	.valids {
		margin-top: 1rem;
		text-align: left;
	}
	.emailfield {
		width: 100%;
		position: relative;
		border-bottom: 2px dashed;
		margin: 1.5rem auto 3rem;
	}
	.pwdfield {
		width: 100%;
		position: relative;
		border-bottom: 2px dashed;
		margin: 2rem auto 0.5rem;
	}

	.label {
		color: var(--text-color);
		font-size: 1.2rem;
	}

	.input {
		outline: none;
		border: none;
		overflow: hidden;
		margin: 0;
		width: 100%;
		padding: 0.25rem;
		background: none;
		color: white;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.input:valid {
		color: yellowgreen;
	}

	.input:invalid {
		color: orangered;
	}

	/* Border animation*/

	.field::after {
		content: '';
		position: relative;
		display: block;
		height: 4px;
		width: 100%;
		background: #d16dff;
		transform: scaleX(0);
		transform-origin: 0%;
		transition: transform 500ms ease;
		top: 2px;
	}

	.field:focus-within {
		border-color: transparent;
	}

	.field:focus-within::after {
		transform: scaleX(1);
	}

	/* Label animation*/

	.label {
		z-index: -1;
		position: absolute;
		transform: translateY(-2rem);
		transform-origin: 0%;
		transition: transform 400ms;
	}

	.field:focus-within .label,
	.input:not(:placeholder-shown) + .label {
		transform: scale(0.8) translateY(-5rem);
	}

	/* Strength Meter */

	.strength {
		display: flex;
		height: 20px;
		width: 100%;
	}

	.bar {
		margin: 0 5px;
		height: 100%;
		width: 25%;
		transition: box-shadow 500ms;
		box-shadow: inset 0px 20px #1f1f1f;
	}

	.bar-show {
		box-shadow: none;
	}

	.bar-1 {
		background: linear-gradient(to right, red, orangered);
	}

	.bar-2 {
		background: linear-gradient(to right, orangered, yellow);
	}

	.bar-3 {
		background: linear-gradient(to right, yellow, yellowgreen);
	}

	.bar-4 {
		background: linear-gradient(to right, yellowgreen, green);
	}

	.toggle-password {
		position: absolute;
		cursor: help;
		font-size: 0.8rem;
		right: 0.25rem;
		bottom: 0.5rem;
	}
</style>
