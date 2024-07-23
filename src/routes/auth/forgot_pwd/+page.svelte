<script lang="ts">
	export let data;
	$: ({ supabase } = data);

	let email: string = '';
	async function SendResetPwdEmail() {
		if (email) {
			const { data, error } = await supabase.auth.resetPasswordForEmail(email);
		}
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
			<button class="variant-filled-tertiary btn" on:click={SendResetPwdEmail}
				>Send reset password email</button
			>
		</div>
	</div>
</form>
