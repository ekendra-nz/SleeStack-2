<script>
	export let data;
	$: ({ countries } = data);
</script>

<h1 class="h1">Home</h1>
<div class="m-10"></div>

<ul>
	{#each countries as country}
		<li>{country.name}</li>
	{/each}
</ul>
