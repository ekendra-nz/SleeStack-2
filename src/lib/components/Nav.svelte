<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Icon from '@iconify/svelte';

	export let data;
	$: ({ session } = data);

	const drawerStore = getDrawerStore();
	const drawerSettings: DrawerSettings = {
		id: 'sidebar_menu',
		// Provide your property overrides:
		position: 'right',
		bgBackdrop: 'bg-gradient-to-r from-secondary-300  ',
		width: 'md:1/5',
		padding: 'p-1',
		rounded: 'rounded-xl'
	};

	const drawerOpen = () => {
		drawerStore.open(drawerSettings);
	};
</script>

<header class="sticky top-0 z-10 backdrop-blur-sm">
	<nav class="flex flex-wrap items-center bg-secondary-500 px-6 py-2 shadow-md lg:px-16 lg:py-0">
		<div class="my-2 flex flex-1 items-center justify-between">
			<a href="/" class="mr-4 inline-flex items-center">
				<svg
					width="40"
					height="40"
					viewBox="0 0 506.27598 507.72168"
					version="1.1"
					id="svg184"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs id="defs188" />
					<path
						fill="#000000"
						d="m 506.27598,319.48842 c 0,103.74602 -113.54564,188.23324 -253.13799,188.23324 C 113.54566,507.72166 7.4142456e-8,423.28983 7.4142456e-8,319.48842 A 174.64938,157.84032 0 0 1 14.249068,257.22789 c 9.314243,24.22063 32.273626,46.21998 66.932311,63.5229 43.975471,21.97397 102.197471,34.07853 163.920441,34.07853 61.72425,0 119.94625,-12.10456 163.92173,-34.07505 43.97548,-21.97397 69.31737,-51.7011 71.45345,-83.90104 a 177.56432,160.47471 0 0 1 25.79898,82.63634 z M 458.50075,32.976392 C 441.91514,19.902554 423.40157,9.3142469 407.66758,3.9277808 393.34829,-0.9936589 382.35379,-1.2994459 377.5275,3.0623458 l -0.70735,0.5861879 -6.65212,5.1072192 a 10.537414,9.5232455 0 0 0 -1.30999,13.3011581 33.924526,30.659472 0 0 1 -0.63202,39.795004 L 152.50077,285.17219 a 74.189631,67.049279 0 0 0 -17.48321,33.37117 c 33.23122,9.84288 71.08447,15.01818 110.12894,15.01818 12.3045,0 24.68052,-0.5308 36.88288,-1.56932 L 423.21133,113.25989 a 34.039438,30.763325 0 0 1 47.63988,-10.48099 l 0.86822,0.49273 a 10.52337,9.5105524 0 0 0 14.09969,-2.40822 l 10.19907,-12.596115 c 6.22566,-7.47505 -6.32909,-30.737939 -37.51488,-55.290903 z M 269.32524,131.93599 a 395.52653,357.45923 0 0 0 -24.12255,-0.68082 c -57.80957,0 -111.98285,11.16066 -152.528849,31.41759 -38.33842,19.15266 -59.457938,43.89256 -59.457938,69.7356 0,25.84188 21.118241,50.5414 59.457938,69.73559 6.343123,3.16518 13.053979,6.09266 20.029129,8.80435 a 97.547374,88.158967 0 0 1 22.07584,-39.78231 z m 128.40758,170.24835 c 38.33842,-19.15266 59.45794,-43.89256 59.45794,-69.7356 0,-22.12051 -15.52586,-43.46791 -44.15168,-61.18394 L 311.59236,328.34701 c 32.18809,-5.10607 61.62084,-13.9912 86.0664,-26.20074 z"
						id="path182"
						style="fill:#2c9d9f;fill-opacity:1;stroke-width:1.21381"
					/>
				</svg>
				<span class="pl-3 text-xl font-bold uppercase tracking-wide text-primary-600"
					>SleeStack 2</span
				>
			</a>
		</div>
		<label for="menu-toggle" class="block cursor-pointer lg:hidden">
			<Icon icon="icon-park-outline:hamburger-button" width="1.2em" height="1.2em" />
		</label>
		<input class="hidden" type="checkbox" id="menu-toggle" />
		<div class="hidden w-full lg:flex lg:w-auto lg:items-center" id="menu">
			<nav>
				<ul
					class="items-center gap-x-5 pt-4 text-center text-xl md:gap-x-4 lg:flex lg:pt-0 lg:text-lg"
				>
					<li class="py-2 lg:py-0">
						<a
							class="text-primary-600 hover:border-b-4 hover:border-tertiary-400 hover:pb-4"
							href="/about"
						>
							About
						</a>
					</li>
					<li class="py-2 lg:py-0">
						<a
							class="text-primary-600 hover:border-b-4 hover:border-tertiary-400 hover:pb-4"
							href="/contact"
						>
							Contact
						</a>
					</li>
					<li class="py-1 lg:py-0">
						{#if session?.user}
							<!-- <button class="variant-ghost-primary btn" on:click={drawerOpen}
								>{session?.user?.email}</button
							> -->
							<button class="variant-ghost-primary btn" on:click={drawerOpen}>Your Account</button>
						{:else}
							<a href="/auth"><button class="variant-ghost-primary btn">Sign In/Up</button></a>
						{/if}
					</li>
				</ul>
			</nav>
		</div>
	</nav>
</header>

<style>
	/* toggle the menu */
	#menu-toggle:checked + #menu {
		display: block;
	}
</style>
