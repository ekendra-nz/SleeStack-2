<script lang="ts">
	import Icon from '@iconify/svelte';
	// Forms
	import type { ActionResult } from '@sveltejs/kit';
	import { applyAction, deserialize } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Turnstile } from 'svelte-turnstile';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { siteSettingsClient } from '$lib/stores';

	$: settings = $siteSettingsClient;

	// Toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	let email: string = '';
	let loading: boolean = false;
	let rego: boolean = false;
	let resetCaptcha: number = 0;
	let turnStileSuccess: boolean = false;

	function handleTurnstileCallback(response: any) {
		turnStileSuccess = true;
		// console.log('Turnstile token:', turnstileToken);
	}

	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	const handleSubmit = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		// UI stuff
		loading = true;
		// evt.preventDefault();
		const data = new FormData(event.currentTarget);
		// console.log('data', data.get('email'));

		if (!isValidEmail(email)) {
			const toast: ToastSettings = {
				message: 'Please enter a valid email address.',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
			loading = false;
			// resetCaptcha++;
			return;
		}
		if (strength < 4) {
			const toast: ToastSettings = {
				message: 'Password did not meet the requirements.',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(toast);
			loading = false;
			// resetCaptcha++;
			return;
		}

		if (rego === true) {
			// sign up
			const response = await fetch('?/signup', {
				method: 'POST',
				body: data
			});
			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success') {
				const toast: ToastSettings = {
					message:
						'Verification email sent to <strong>' +
						email +
						'</strong>. <br />Follow the link in your email to continue.<br /> If you do not receive the email, please check your spam folder.',
					background: 'variant-filled-success',
					timeout: 5000
				};
				toastStore.trigger(toast);
				loading = false;
			} else if (result.type === 'failure') {
				const toast: ToastSettings = {
					message: result.data?.error || 'There was a problem signing you up.',
					background: 'variant-filled-error',
					timeout: 5000
				};
				toastStore.trigger(toast);

				await invalidateAll();
				loading = false;
				resetCaptcha++;
			}
			applyAction(result);
		} else {
			// sign in
			const response = await fetch('?/signin', {
				method: 'POST',
				body: data
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success') {
				const toast: ToastSettings = {
					message: 'Signed in.',
					background: 'variant-filled-success',
					timeout: 3000
				};
				toastStore.trigger(toast);
				loading = false;

				// goto('/user');
				// await goto('/user');
				await invalidateAll();
				setTimeout(() => goto('/user'), 100); //
			} else if (result.type === 'failure') {
				console.log('result.data', result.data);
				const toast: ToastSettings = {
					message:
						'There was a problem signing you in: <br /><strong> ' +
						result.data?.error +
						'</strong><br />Please try again.',
					background: 'variant-filled-error',
					timeout: 5000
				};
				toastStore.trigger(toast);

				loading = false;
				resetCaptcha++;
			}
			applyAction(result);
			loading = false;
		}
	};

	// password stuff ---------------------------------------------------------------------------

	let strength = 0;
	let validations: any = [];
	let showPassword = false;

	function validatePassword(e: any) {
		const password = e.target.value;

		validations = [
			password.length >= 8,
			password.search(/[A-Z]/) > -1,
			password.search(/[0-9]/) > -1,
			password.search(/[$&+,:;=?@#!]/) > -1
		];

		strength = validations.reduce((acc: any, cur: any) => acc + cur);
		// console.log('strength', strength);
	}
</script>

<form method="POST" class="text-primary-500" on:submit|preventDefault={handleSubmit}>
	<p class="text-tertiary-500">
		We strongly recommend that you use a password manager such as <a
			href="https://bitwarden.com/"
			target="_blank"
			class="anchor">Bitwarden</a
		> to generate and keep track of unique passwords.
	</p>
	<div class="field emailfield">
		<input type="email" name="email" class="input" required placeholder=" " bind:value={email} />
		<label for="email" class="label">Email</label>
	</div>

	<div class="field pwdfield">
		<input
			id="password"
			name="password"
			type={showPassword ? 'text' : 'password'}
			class="input"
			placeholder=" "
			on:input={validatePassword}
		/>
		<label for="password" class="label">Password</label>

		<div
			class="toggle-password"
			on:mouseenter={() => (showPassword = true)}
			on:mouseleave={() => (showPassword = false)}
			role="button"
			tabindex="0"
		>
			{showPassword ? '🙈' : '👁‍🗨'}
		</div>
	</div>

	<div class="strength">
		<span class="bar bar-1 variant-ghost-primary rounded-xl" class:bar-show={strength > 0}></span>
		<span class="bar bar-2 rounded-xl" class:bar-show={strength > 1}></span>
		<span class="bar bar-3 rounded-xl" class:bar-show={strength > 2}></span>
		<span class="bar bar-4 rounded-xl" class:bar-show={strength > 3}></span>
	</div>

	<ul class="valids">
		<li class="flex flex-row items-center">
			<div class="flex">
				{#if validations[0]}
					<Icon icon="gg:check-o" width="1.2em" height="1.2em" class="text-success-500" />
				{:else}
					<Icon
						icon="icon-park-outline:error"
						width="1.2em"
						height="1.2em"
						class=" text-error-500"
					/>
				{/if}
			</div>
			<div class="ml-1 flex">must be at least 8 characters</div>
		</li>
		<li class="flex flex-row items-center">
			<div class="flex">
				{#if validations[1]}
					<Icon icon="gg:check-o" width="1.2em" height="1.2em" class="text-success-500" />
				{:else}
					<Icon
						icon="icon-park-outline:error"
						width="1.2em"
						height="1.2em"
						class=" text-error-500"
					/>
				{/if}
			</div>
			<div class="ml-1 flex">must contain a capital letter</div>
		</li>
		<li class="flex flex-row items-center">
			<div class="flex">
				{#if validations[2]}
					<Icon icon="gg:check-o" width="1.2em" height="1.2em" class="text-success-500" />
				{:else}
					<Icon
						icon="icon-park-outline:error"
						width="1.2em"
						height="1.2em"
						class=" text-error-500"
					/>
				{/if}
			</div>
			<div class="ml-1 flex">must contain a number</div>
		</li>
		<li class="flex flex-row items-center">
			<div class="flex">
				{#if validations[3]}
					<Icon icon="gg:check-o" width="1.2em" height="1.2em" class="text-success-500" />
				{:else}
					<Icon
						icon="icon-park-outline:error"
						width="1.2em"
						height="1.2em"
						class=" text-error-500"
					/>
				{/if}
			</div>
			<div class="ml-1 flex">must contain at least one: $&+,:;=?@#!</div>
		</li>
	</ul>
	<div class="mt-2 flex flex-col items-end">
		<a href="/auth/forgot_pwd" class="text-xs text-tertiary-400 hover:text-secondary-300"
			>Forgot your password?</a
		>
	</div>
	{#if settings.useCaptcha}
		{#key resetCaptcha}
			<div class="mt-3">
				<Turnstile
					siteKey={PUBLIC_TURNSTILE_SITE_KEY}
					on:callback={(event) => handleTurnstileCallback(event.detail)}
				/>
			</div>
			<!-- bind:resetCaptcha -->
		{/key}
	{/if}
	<div class="mx-5 mt-5 flex flex-col items-center">
		<div class="flex w-3/4 flex-row items-center lg:w-1/2">
			{#if turnStileSuccess || !settings.useCaptcha}
				<div class="mx-auto flex-auto">
					<button class="variant-ghost-tertiary btn btn-sm" on:mousedown={() => (rego = true)}
						>Register</button
					>
				</div>
				<div class="mx-1 flex-auto">or</div>
				<div class="mx-auto flex-auto">
					<button
						class="variant-filled-tertiary btn btn-sm"
						type="submit"
						on:click={() => (rego = false)}>Sign In</button
					>
				</div>
				<div class="mx-2 flex">
					{#if !loading}
						<Icon icon="ic:baseline-lock" width="1.2em" height="1.2em" class="text-tertiary-500" />
					{:else}
						<Icon icon="line-md:loading-loop" width="2em" height="2em" class="text-tertiary-500" />
					{/if}
				</div>
			{/if}
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
