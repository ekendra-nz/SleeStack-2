<script lang="ts">
	import Icon from '@iconify/svelte';

	let email: string = 'le.pattillo.nz@gmail.com';
	let pwd: string = 'pleestack';

	let loading: boolean = false;

	const handleSubmit = async (evt: SubmitEvent) => {
		// evt.preventDefault();
		loading = true;
		// console.log('submitting');
	};
</script>

<!-- --------------------------------------------------------------------------------------------------------------------------------------------------- -->
<div class="mt-20 flex items-center justify-center">
	<div class=" flex flex-col items-center space-y-10 text-center">
		<div class="card variant-glass-primary mr-auto w-72 border border-primary-500 p-4 shadow-xl">
			<div>
				<form method="POST" action="?/login" on:submit={handleSubmit}>
					<div>
						<label for="email-address" class="sr-only">Email address</label>

						<input
							id="email-address"
							name="email"
							type="email"
							autocomplete="email"
							required
							class="relative block w-full appearance-none rounded-none rounded-t-md border border-primary-300 px-3 py-2 text-secondary-900 placeholder-gray-500 focus:z-10 focus:border-tertiary-500 focus:outline-none focus:ring-tertiary-500 sm:text-sm"
							placeholder="Email address"
							bind:value={email}
						/>
					</div>

					<div>
						<label for="password" class="sr-only">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="relative block w-full appearance-none rounded-none rounded-b-md border border-tertiary-300 px-3 py-2 text-secondary-900 placeholder-gray-500 focus:z-10 focus:border-tertiary-500 focus:outline-none focus:ring-tertiary-500 sm:text-sm"
							placeholder="Password"
							bind:value={pwd}
						/>
					</div>
					<div class="flex flex-col items-end">
						<a href="/auth/forgot_pwd" class="text-xs text-tertiary-400 hover:text-secondary-300"
							>Forgot your password?</a
						>
					</div>
					<div class="mx-5 mt-5 flex w-full items-center">
						<div class="flex">
							<button class="variant-ghost-tertiary btn btn-sm" type="submit" formaction="?/signup"
								>Register</button
							>
						</div>
						<div class="mx-2 flex">or</div>
						<div class="mr-2 flex">
							<button class="variant-filled-tertiary btn btn-sm" type="submit">Sign In</button>
						</div>
						<div class="mr-2 flex">
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
				</form>
			</div>
		</div>
	</div>
</div>
