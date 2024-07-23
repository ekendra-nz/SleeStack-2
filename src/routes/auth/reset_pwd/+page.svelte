<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ supabase, user } = data);

	let pwd: string = '';

	onMount(() => {
		console.log('user: ', user);
	});
	async function resetPwd() {
		const { error } = await supabase.auth.updateUser({ password: pwd });
		if (error) {
			console.error(error);
		}
	}
</script>

<h1>New password</h1>
<p>Pwd:</p>
<input name="password" type="password" bind:value={pwd} />
<button class="btn" on:click={resetPwd}>Reset Password</button>
