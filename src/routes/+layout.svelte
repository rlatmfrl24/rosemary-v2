<script lang="ts">
import "../app.css";

const { children } = $props();

// set the title of the page
$effect(() => {
	document.title = "Rosemary";
});
</script>

{@render children()}
