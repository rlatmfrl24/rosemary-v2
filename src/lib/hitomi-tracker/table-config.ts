import type { ColumnDef } from '@tanstack/table-core';
import type { HitomiItem } from './types';
import { formatCreatedAt } from './utils';

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
		size: 40
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
