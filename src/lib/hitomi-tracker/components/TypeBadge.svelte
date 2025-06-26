<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '@/lib/utils';

	let { type }: { type: string } = $props();

	const getColorForType = (type: string) => {
		switch (type) {
			case 'Doujinshi':
				return 'bg-red-500';
			case 'Manga':
				return 'bg-blue-500';
			case 'Artist CG':
				return 'bg-green-500';
			case 'Image Set':
				return 'bg-yellow-500';
			case 'Western':
				return 'bg-purple-500';
			case 'Non-H':
				return 'bg-pink-500';
		}
	};
</script>

<Badge variant="default" class={cn(getColorForType(type), 'font-semibold')}>
	{type}
</Badge>
