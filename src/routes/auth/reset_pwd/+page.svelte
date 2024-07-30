<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	// Forms
	import type { ActionResult } from '@sveltejs/kit';
	import { applyAction, deserialize } from '$app/forms';

	// toast
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { goto, invalidateAll } from '$app/navigation';
	const toastStore = getToastStore();

	export let data: PageData;
	$: ({ supabase, user } = data);

	let pwd: string = '';
	let pwd2: string = '';

	let strength = 0;
	let validations: any = [];
	let passwordMatch: boolean = false;
	let showPassword: boolean = false;
	let loading: boolean = false;

	async function resetPwd() {
		loading = true;
		// console.log('pwd', pwd);
		// console.log('pwd2', pwd2);
		// console.log('strength', strength);
		// console.log('passwordMatch', passwordMatch);

		if (!passwordMatch) {
			console.error('Passwords do not match');
			const t: ToastSettings = {
				message: 'Your passwords do not match.',
				background: 'variant-filled-error',
				timeout: 2000
			};
			toastStore.trigger(t);
			loading = false;
			return;
		}

		if (strength < 4) {
			console.error('Your password did not meet the requirements.');
			const t: ToastSettings = {
				message: 'Your password did not meet the requirements.',
				background: 'variant-filled-error',
				timeout: 5000
			};
			toastStore.trigger(t);
			loading = false;

			return;
		}

		const { error } = await supabase.auth.updateUser({ password: pwd });
		if (error) {
			console.error(error);
			const t: ToastSettings = {
				message: 'There was a problem resetting your password: ' + error.message,
				background: 'variant-filled-error',
				timeout: 10000
			};
			toastStore.trigger(t);
			loading = false;

			return;
		} else {
			const t: ToastSettings = {
				message: 'Password reset successfully. Please log in again.',
				hideDismiss: true,
				background: 'variant-filled-success',
				timeout: 5000
			};
			toastStore.trigger(t);
			loading = false;

			invalidateAll();
			const { error } = await supabase.auth.signOut();
			goto('/auth');
		}
		loading = false;
	}

	function checkMatchingPassword(e: any) {
		pwd2 = e.target.value;
		if (pwd2 == pwd) {
			// make border green
			passwordMatch = true;
		} else {
			// make border red
			passwordMatch = false;
		}
	}

	function validatePassword(e: any) {
		pwd = e.target.value;

		validations = [
			pwd.length >= 8,
			pwd.search(/[A-Z]/) > -1,
			pwd.search(/[0-9]/) > -1,
			pwd.search(/[$&+,:;=?@#!]/) > -1
		];

		strength = validations.reduce((acc: any, cur: any) => acc + cur);
		// console.log('strength', strength);
	}
</script>

<h2 class="h2">New password</h2>

<div class="mt-20 flex items-center justify-center">
	<div class=" flex flex-col items-center space-y-10 text-center">
		<div class="card variant-glass-secondary mr-auto w-96 border border-primary-500 p-4 shadow-xl">
			<form method="POST" class="text-primary-500" on:submit|preventDefault={resetPwd}>
				<div class=" flex w-full flex-col items-center">
					<div>
						<p class="text-tertiary-500">
							We strongly recommend that you use a password manager such as <a
								href="https://bitwarden.com/"
								target="_blank"
								class="anchor">Bitwarden</a
							> to generate and keep track of unique passwords.
						</p>
					</div>
					<div class="sm:3/4 mt-1 w-full">
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
								tabindex="-1"
							>
								{showPassword ? '🙈' : '👁‍🗨'}
							</div>
						</div>
						<div class="strength">
							<span class="bar bar-1 variant-ghost-primary rounded-xl" class:bar-show={strength > 0}
							></span>
							<span class="bar bar-2 rounded-xl" class:bar-show={strength > 1}></span>
							<span class="bar bar-3 rounded-xl" class:bar-show={strength > 2}></span>
							<span class="bar bar-4 rounded-xl" class:bar-show={strength > 3}></span>
						</div>
					</div>
					<div class="sm:3/4 my-2 w-full">
						<div class="field pwdfield">
							<input
								id="password2"
								name="password2"
								type={showPassword ? 'text' : 'password'}
								class="input"
								placeholder=" "
								on:input={checkMatchingPassword}
							/>
							<label for="password2" class="label">Confirm password</label>
						</div>
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
					<div class=" mt-2 flex flex-row items-center">
						<div class=" mx-2 flex text-center">
							<button class="variant-filled-tertiary btn" type="submit">Reset Password</button>
						</div>
						<div class="flex flex-col items-center">
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
</div>

<style>
	.valids {
		margin-top: 1rem;
		text-align: left;
	}
	.pwdfield {
		width: 100%;
		position: relative;
		border-bottom: 2px dashed;
		margin: 2rem auto 0.5rem;
	}

	.label {
		/* color: var(--text-color); */
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
		height: 19px;
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
