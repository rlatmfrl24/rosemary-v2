import type { ColumnDef } from '@tanstack/table-core';
import type { HitomiItem } from './types';
import { formatCreatedAt } from './utils';
import { renderComponent } from '$lib/components/ui/data-table/render-helpers';
import TypeBadge from './components/TypeBadge.svelte';

/**
 * Hitomi 트래커 테이블의 컬럼 정의
 */
export const HITOMI_TABLE_COLUMNS: ColumnDef<HitomiItem>[] = [
	{
		header: 'Code',
		accessorKey: 'code',
		size: 40
	},
	{
		header: 'Name',
		accessorKey: 'name',
		size: 320
	},
	{
		header: 'Type',
		accessorKey: 'type',
		size: 40,
		cell: ({ row }) => {
			const type = row.original.type;
			return renderComponent(TypeBadge, {
				type
			});
		}
	},
	{
		header: 'URL',
		accessorKey: 'url',
		size: 120
	},
	{
		header: 'Created At',
		accessorKey: 'createdAt',
		size: 100,
		cell: ({ row }) => formatCreatedAt(row.original.createdAt)
	}
];
