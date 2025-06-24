<script lang="ts">
	import '../app.css';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	const { children } = $props();

	// set the title of the page
	$effect(() => {
		document.title = 'Rosemary';
	});
</script>

<Toaster position="bottom-center" richColors />

<div class="flex flex-col justify-center items-center h-screen">
	<header class="w-full p-4 bg-slate-900 text-white flex items-center">
		<h1 class="text-4xl font-bold mr-6">Rosemary</h1>
		<nav class="flex items-center gap-4">
			<a href="/hitomi-tracker">Hitomi Tracker</a>
			<a href="/torrent-tracker">Torrent Tracker</a>
			<a href="/torrent-trend">Torrent Trend</a>
		</nav>
		<div class="flex items-center gap-4 ml-auto">
			<Button>Login</Button>
		</div>
	</header>
	<main class="w-full h-full">
		{@render children()}
	</main>
	<footer class="w-full px-4 py-2 bg-slate-900 text-white flex items-center">
		<p>Copyright 2025 Rosemary</p>
	</footer>
</div>
