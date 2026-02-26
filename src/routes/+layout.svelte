<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	const { children } = $props();

	// set the title of the page
	$effect(() => {
		document.title = 'Rosemary';
	});
</script>

<Toaster position="top-center" richColors />

<div class="flex min-h-screen flex-col overflow-hidden">
	<header class="w-full p-4 bg-slate-900 text-white flex items-center">
		<h1 class="text-4xl font-bold mr-6">Rosemary</h1>
		<nav class="flex items-center gap-4">
			<a href="/daily-check">Daily Check</a>
			<a href="/hitomi-tracker">Hitomi Tracker</a>
		</nav>
	</header>
	<main class="w-full h-full flex-1 flex-col flex overflow-hidden">
		<div class="flex h-0 overflow-auto flex-grow w-full flex-col">
			{@render children()}
		</div>
	</main>
	<footer class="w-full px-4 py-2 bg-slate-900 text-white flex items-center">
		<p>Copyright 2025 Rosemary</p>
	</footer>
</div>
