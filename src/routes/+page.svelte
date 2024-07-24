<script>
	export let data;
	$: ({ countries } = data);
</script>

<h1 class="h1">Home</h1>
<div class="container flex w-full flex-grow flex-col items-center">
	<div class="rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500">
		<p>These values are pulled from a Supabase table and can be viewed by any user.</p>
	</div>
</div>
<div class="container flex w-full flex-grow flex-col items-center">
	<div class="rounded-lg border border-secondary-600 bg-primary-500 p-4 text-secondary-500">
		<h2 class="h2">Countries:</h2>
		<ul>
			{#each countries as country}
				<li><p>{country.name}</p></li>
			{/each}
		</ul>
	</div>
</div>
