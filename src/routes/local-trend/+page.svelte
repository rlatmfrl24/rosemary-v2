<script lang="ts">
	import type { PageData } from './$types';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '@/lib/components/ui/button';
	import { Textarea } from '@/lib/components/ui/textarea';
	import { ScrollArea } from '@/lib/components/ui/scroll-area';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export let data: PageData;

	// 텍스트 입력
	let inputText = '';

	// DB에서 로드된 데이터
	$: dbItems = (data.items || []) as Array<{
		id: number;
		name: string;
		downloaded: boolean;
		createdAt: number;
	}>;

	// 텍스트 파싱 함수
	// 각 줄의 맨 앞에 있는 인덱스 숫자와 맨 뒤의 날짜를 제거하고 실제 텍스트만 추출
	function parseText(text: string): Array<{ name: string }> {
		if (!text.trim()) {
			return [];
		}

		// 줄바꿈으로 구분하여 파싱
		const lines = text
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		return lines
			.map((line) => {
				let cleanedLine = line;

				// 1단계: 맨 앞의 모든 숫자와 그 뒤의 공백을 제거
				// 정규식: ^\s*\d+\s*(.+)$
				const frontMatch = cleanedLine.match(/^\s*\d+\s*(.+)$/);
				if (frontMatch?.[1]) {
					cleanedLine = frontMatch[1].trim();
				}

				// 2단계: 맨 뒤의 날짜 형식 (예: 10.22, 1.1, 12.31)과 그 앞의 공백을 제거
				// 정규식: ^(.+?)\s*\d+\.\d+\s*$
				const backMatch = cleanedLine.match(/^(.+?)\s*\d+\.\d+\s*$/);
				if (backMatch?.[1]) {
					cleanedLine = backMatch[1].trim();
				}

				// 최종 텍스트 반환
				return {
					name: cleanedLine
				};
			})
			.filter((item) => item.name.length > 0);
	}

	// 텍스트 변경 시 자동 파싱
	$: parsedData = parseText(inputText);

	// 검색 링크 생성 함수
	function getSearchUrl(item: string): string {
		return `https://www.google.com/search?q=${encodeURIComponent(item)}`;
	}

	// 날짜 포맷 함수
	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// 데이터 저장 핸들러
	async function handleSaveItems() {
		if (parsedData.length === 0) {
			alert('저장할 데이터가 없습니다.');
			return;
		}

		// 중복 체크: DB에 이미 있는 항목은 제외
		const existingNames = new Set(dbItems.map((item) => item.name.toLowerCase().trim()));
		const newItems = parsedData.filter(
			(item) => !existingNames.has(item.name.toLowerCase().trim())
		);

		if (newItems.length === 0) {
			alert('저장할 새로운 데이터가 없습니다. (모두 이미 존재하는 데이터입니다)');
			return;
		}

		// 중복 제거된 항목 수 알림
		const duplicateCount = parsedData.length - newItems.length;
		if (duplicateCount > 0) {
			if (
				!confirm(
					`${duplicateCount}개의 중복 항목이 발견되었습니다.\n${newItems.length}개의 새로운 항목만 저장하시겠습니까?`
				)
			) {
				return;
			}
		}

		const formData = new FormData();
		formData.append('items', JSON.stringify(newItems));

		try {
			const response = await fetch('?/saveItems', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// 페이지 새로고침하여 최신 데이터 반영
				window.location.reload();
			} else {
				alert('데이터 저장에 실패했습니다.');
			}
		} catch (error) {
			console.error('데이터 저장 중 오류:', error);
			alert('데이터 저장 중 오류가 발생했습니다.');
		}
	}

	// 다운로드 상태 토글 핸들러
	async function handleToggleDownload(id: number, currentStatus: boolean) {
		const formData = new FormData();
		formData.append('id', id.toString());
		formData.append('downloaded', (!currentStatus).toString());

		try {
			const response = await fetch('?/toggleDownload', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// 페이지 새로고침하여 최신 데이터 반영
				window.location.reload();
			} else {
				alert('다운로드 상태 변경에 실패했습니다.');
			}
		} catch (error) {
			console.error('다운로드 상태 변경 중 오류:', error);
			alert('다운로드 상태 변경 중 오류가 발생했습니다.');
		}
	}

	// 항목 삭제 핸들러
	async function handleDeleteItem(id: number) {
		if (!confirm('이 항목을 삭제하시겠습니까?')) {
			return;
		}

		const formData = new FormData();
		formData.append('id', id.toString());

		try {
			const response = await fetch('?/deleteItem', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// 페이지 새로고침하여 최신 데이터 반영
				window.location.reload();
			} else {
				alert('데이터 삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('데이터 삭제 중 오류:', error);
			alert('데이터 삭제 중 오류가 발생했습니다.');
		}
	}
</script>

<div class="container mx-auto p-6 flex flex-col h-full gap-4">
	<div class="mb-2">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Local Trend</h1>
		<p class="text-gray-600">로컬 텍스트 데이터를 파싱하여 트렌드를 확인합니다</p>
	</div>

	<!-- 메인 레이아웃: 왼쪽 입력 영역 + 오른쪽 테이블 영역 -->
	<div class="flex gap-4 flex-1 min-h-0">
		<!-- 왼쪽: 입력 영역 (좁게) -->
		<div class="flex flex-col gap-4 w-96 flex-shrink-0">
			<!-- 텍스트 입력 섹션 -->
			<div class="bg-white rounded-lg shadow p-3 flex flex-col flex-1 min-h-0">
				<h2 class="text-lg font-semibold text-gray-900 mb-2">텍스트 입력</h2>
				<Textarea
					bind:value={inputText}
					placeholder="텍스트를 입력하세요 (줄바꿈으로 구분)"
					class="min-h-48 flex-1 text-sm"
				/>
				<div class="mt-2 flex items-center justify-between">
					<div class="text-xs text-gray-500">입력된 항목 수: {parsedData.length}개</div>
					{#if parsedData.length > 0}
						<Button onclick={handleSaveItems} variant="default" size="sm">💾 DB에 저장</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- 오른쪽: DB에서 로드된 데이터 테이블 (넓게) -->
		<div class="flex-1 min-w-0">
			{#if dbItems.length > 0}
				<div class="bg-white rounded-lg shadow h-full flex flex-col">
					<div class="p-3 border-b bg-gray-50">
						<h2 class="text-lg font-semibold text-gray-900">저장된 데이터 ({dbItems.length}개)</h2>
					</div>
					<!-- 고정적 헤더 -->
					<div class="border-b bg-gray-50 flex-shrink-0">
						<Table.Root class="table-fixed">
							<Table.Header>
								<Table.Row class="bg-gray-50">
									<Table.Head class="w-16 text-center font-bold text-xs">순번</Table.Head>
									<Table.Head class="min-w-[300px] font-bold text-xs">항목 이름</Table.Head>
									<Table.Head class="w-32 text-center font-bold text-xs">다운로드</Table.Head>
									<Table.Head class="w-44 font-bold text-xs">생성 날짜</Table.Head>
									<Table.Head class="w-24 text-center font-bold text-xs">검색</Table.Head>
									<Table.Head class="w-24 text-center font-bold text-xs">삭제</Table.Head>
								</Table.Row>
							</Table.Header>
						</Table.Root>
					</div>

					<!-- 스크롤 가능한 바디 -->
					<ScrollArea class="flex-1 overflow-auto">
						<Table.Root class="table-fixed">
							<Table.Body>
								{#each dbItems as item, index}
									<Table.Row class="hover:bg-gray-50">
										<Table.Cell class="w-16 text-center font-medium text-sm">
											{index + 1}
										</Table.Cell>
										<Table.Cell
											class="min-w-[300px] font-medium max-w-0 truncate text-sm"
											title={item.name}
										>
											{item.name}
										</Table.Cell>
										<Table.Cell class="w-32 text-center">
											<div class="flex items-center justify-center">
												<Checkbox
													checked={item.downloaded}
													onCheckedChange={() => handleToggleDownload(item.id, item.downloaded)}
												/>
											</div>
										</Table.Cell>
										<Table.Cell class="w-44">
											<div class="text-xs text-gray-600">
												{formatDate(item.createdAt)}
											</div>
										</Table.Cell>
										<Table.Cell class="w-24 text-center">
											<Button
												size="sm"
												onclick={() => window.open(getSearchUrl(item.name), '_blank')}
											>
												🔍 검색
											</Button>
										</Table.Cell>
										<Table.Cell class="w-24 text-center">
											<Button
												size="sm"
												variant="destructive"
												onclick={() => handleDeleteItem(item.id)}
											>
												🗑️ 삭제
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</ScrollArea>
				</div>
			{:else}
				<div class="bg-white rounded-lg shadow h-full flex items-center justify-center">
					<div class="text-center">
						<div class="text-gray-400 text-lg mb-2">📊</div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">저장된 데이터가 없습니다</h3>
						<p class="text-gray-500">텍스트를 입력하고 저장하면 데이터가 표시됩니다.</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1500px;
	}
</style>
