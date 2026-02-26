<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import {
		buildDailyCheckItemView,
		getReminderToastKey,
		summarizeRemainingMinutes,
		type DailyCheckItemView,
		type DailyReminder
	} from '$lib/daily-check';
	import {
		getNotificationPermissionState,
		hasActivePushSubscription,
		isWebPushSupported,
		subscribeToDailyCheckPush,
		syncDailyCheckPushSubscription,
		unsubscribeFromDailyCheckPush
	} from '$lib/daily-check/notifications';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';

	interface ActionPayload {
		success?: boolean;
		message?: string;
		error?: string;
	}

	const { data }: { data: PageData } = $props();
	const DEFAULT_RESET_TIME = '09:00';

	let now = $state(new Date(data.serverNow));
	let editingItemId = $state<number | null>(null);
	let reminder = $state<DailyReminder | null>(null);
	let reminderError = $state<string | null>(null);
	let reminderToastKey = $state<string | null>(null);
	let notificationPermission = $state<NotificationPermission | 'unsupported'>('unsupported');
	let isPushSubscribed = $state(false);
	let isNotificationBusy = $state(false);
	let isCreateModalOpen = $state(false);
	let isPushModalOpen = $state(false);
	let createKind = $state<string>('site_visit');
	let createImportance = $state<string>(data.defaultImportance);
	let createResetTimes = $state<string[]>([DEFAULT_RESET_TIME]);
	let editingKind = $state<string>('site_visit');
	let editingImportance = $state<string>(data.defaultImportance);
	let editingResetTimes = $state<string[]>([DEFAULT_RESET_TIME]);
	let celebrationItemIds = $state<number[]>([]);
	const previousCompletionMap = new Map<number, boolean>();

	const itemViews = $derived(data.items.map((item) => buildDailyCheckItemView(item, now)));
	const completedCount = $derived(itemViews.filter((item) => item.isCompleted).length);
	const remainingCount = $derived(itemViews.filter((item) => !item.isCompleted).length);
	const remainingMinutes = $derived(summarizeRemainingMinutes(itemViews));
	const sortedItemViews = $derived(
		[...itemViews].sort((left, right) => {
			if (left.isCompleted !== right.isCompleted) {
				return left.isCompleted ? 1 : -1;
			}

			if (!left.isCompleted) {
				const overdueDiff = right.minutesPastReset - left.minutesPastReset;
				if (overdueDiff !== 0) return overdueDiff;
				return left.nextResetAt - right.nextResetAt;
			}

			const completedAtDiff = (right.completedAt ?? 0) - (left.completedAt ?? 0);
			if (completedAtDiff !== 0) return completedAtDiff;
			return right.updatedAt - left.updatedAt;
		})
	);
	const kindLabelMap = $derived(
		new Map<string, string>(data.kindOptions.map((option) => [option.value, option.label]))
	);
	const importanceLabelMap = $derived(
		new Map<string, string>(data.importanceOptions.map((option) => [option.value, option.label]))
	);

	function getKindLabel(kind: string): string {
		return kindLabelMap.get(kind) ?? kind;
	}

	function getImportanceLabel(importance: string): string {
		return importanceLabelMap.get(importance) ?? importance;
	}

	function getImportanceToneClass(importance: string): string {
		if (importance === 'critical') return 'bg-rose-600 text-white';
		if (importance === 'high') return 'bg-orange-500 text-white';
		if (importance === 'low') return 'bg-slate-400 text-white';
		return 'bg-blue-500 text-white';
	}

	function isSiteVisitKind(kind: string): boolean {
		return kind === 'site_visit';
	}

	function resetCreateFormState() {
		createKind = 'site_visit';
		createImportance = data.defaultImportance;
		createResetTimes = [DEFAULT_RESET_TIME];
	}

	function resetEditState() {
		editingItemId = null;
		editingKind = 'site_visit';
		editingImportance = data.defaultImportance;
		editingResetTimes = [DEFAULT_RESET_TIME];
	}

	function addCreateResetTime() {
		createResetTimes = [...createResetTimes, DEFAULT_RESET_TIME];
	}

	function removeCreateResetTime(index: number) {
		if (createResetTimes.length <= 1) return;
		createResetTimes = createResetTimes.filter((_, currentIndex) => currentIndex !== index);
	}

	function updateCreateResetTime(index: number, value: string) {
		const next = [...createResetTimes];
		next[index] = value;
		createResetTimes = next;
	}

	function addEditingResetTime() {
		editingResetTimes = [...editingResetTimes, DEFAULT_RESET_TIME];
	}

	function removeEditingResetTime(index: number) {
		if (editingResetTimes.length <= 1) return;
		editingResetTimes = editingResetTimes.filter((_, currentIndex) => currentIndex !== index);
	}

	function updateEditingResetTime(index: number, value: string) {
		const next = [...editingResetTimes];
		next[index] = value;
		editingResetTimes = next;
	}

	function openCreateModal() {
		resetCreateFormState();
		isCreateModalOpen = true;
	}

	function openEditItem(item: DailyCheckItemView) {
		editingItemId = item.id;
		editingKind = item.kind;
		editingImportance = item.importance;
		editingResetTimes = item.resetTimes.length > 0 ? [...item.resetTimes] : [DEFAULT_RESET_TIME];
	}

	function startCelebration(itemId: number) {
		if (celebrationItemIds.includes(itemId)) return;
		celebrationItemIds = [...celebrationItemIds, itemId];
		setTimeout(() => {
			celebrationItemIds = celebrationItemIds.filter((id) => id !== itemId);
		}, 1600);
	}

	function isCelebrating(itemId: number): boolean {
		return celebrationItemIds.includes(itemId);
	}

	function getActionPayload(result: unknown): ActionPayload | null {
		if (!result || typeof result !== 'object' || !('data' in result)) return null;
		const data = (result as { data?: ActionPayload }).data;
		return data ?? null;
	}

	function closeModalOnBackdrop(event: MouseEvent, modal: 'create' | 'push') {
		if (event.target !== event.currentTarget) return;
		if (modal === 'create') {
			isCreateModalOpen = false;
			resetCreateFormState();
			return;
		}
		isPushModalOpen = false;
	}

	async function refreshReminder(showToast: boolean): Promise<void> {
		try {
			const response = await fetch('/api/daily-check/reminders', {
				headers: { Accept: 'application/json' }
			});
			if (!response.ok) {
				reminderError = '리마인더 정보를 불러오지 못했습니다.';
				return;
			}
			const result = (await response.json()) as {
				success: boolean;
				reminder: DailyReminder | null;
				error?: string;
			};
			if (!result.success) {
				reminderError = result.error ?? '리마인더 정보를 불러오지 못했습니다.';
				return;
			}

			reminderError = null;
			reminder = result.reminder;
			if (!showToast || !result.reminder || result.reminder.itemCount === 0) return;

			const nextToastKey = getReminderToastKey(result.reminder.itemCount, result.reminder.cycleKeys);
			if (reminderToastKey === nextToastKey) return;
			reminderToastKey = nextToastKey;

			const description =
				result.reminder.totalEstimatedMinutes > 0
					? `예상 소요시간 ${result.reminder.totalEstimatedMinutes}분`
					: '남은 예상 시간 정보 없음';
			toast.info(`미완료 출석 항목 ${result.reminder.itemCount}개`, { description });
		} catch (error) {
			console.warn('Failed to refresh reminder', error);
			reminderError = '리마인더 정보를 불러오지 못했습니다.';
		}
	}

	async function refreshPushState(): Promise<void> {
		if (!browser) return;
		notificationPermission = getNotificationPermissionState();
		if (!isWebPushSupported() || notificationPermission === 'unsupported') {
			isPushSubscribed = false;
			return;
		}

		try {
			if (notificationPermission === 'granted' && data.vapidPublicKey) {
				await syncDailyCheckPushSubscription(data.vapidPublicKey);
			}
			isPushSubscribed = await hasActivePushSubscription();
		} catch (error) {
			console.warn('Failed to refresh push state', error);
			isPushSubscribed = false;
		}
	}

	const createEnhanceHandler = (options?: {
		closeEditor?: boolean;
		closeCreateModal?: boolean;
		silentSuccess?: boolean;
	}) => {
		return () => {
			return async ({ result, update }: { result: unknown; update: () => Promise<void> }) => {
				await update();
				now = new Date();
				await refreshReminder(false);

				const payload = getActionPayload(result);
				if (!payload) return;

				if (payload.success) {
					if (options?.closeEditor) {
						resetEditState();
					}
					if (options?.closeCreateModal) {
						isCreateModalOpen = false;
						resetCreateFormState();
					}
					if (!options?.silentSuccess && payload.message) {
						toast.success(payload.message);
					}
					return;
				}

				if (payload.error) {
					toast.error(payload.error);
				}
			};
		};
	};

	const onToggleCompleteChange = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const form = input.form;
		if (!form) return;

		const hiddenCompleted = form.querySelector<HTMLInputElement>('input[name="completed"]');
		if (!hiddenCompleted) return;
		hiddenCompleted.value = input.checked ? 'true' : 'false';
		form.requestSubmit();
	};

	async function handleEnablePush(): Promise<void> {
		if (!data.vapidPublicKey) {
			toast.error('VAPID 공개키가 설정되지 않았습니다.');
			return;
		}

		isNotificationBusy = true;
		try {
			const result = await subscribeToDailyCheckPush(data.vapidPublicKey);
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '웹푸시 활성화에 실패했습니다.');
		} finally {
			await refreshPushState();
			isNotificationBusy = false;
		}
	}

	async function handleDisablePush(): Promise<void> {
		isNotificationBusy = true;
		try {
			const result = await unsubscribeFromDailyCheckPush();
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '웹푸시 해지에 실패했습니다.');
		} finally {
			await refreshPushState();
			isNotificationBusy = false;
		}
	}

	onMount(() => {
		if (!browser) return;

		void refreshPushState();
		void refreshReminder(true);

		const timer = setInterval(() => {
			now = new Date();
			void refreshReminder(false);
		}, 60000);

		return () => clearInterval(timer);
	});

	$effect(() => {
		if (!browser) return;

		const currentIds = new Set<number>();
		for (const item of sortedItemViews) {
			currentIds.add(item.id);
			const previous = previousCompletionMap.get(item.id);
			if (previous === false && item.isCompleted) {
				startCelebration(item.id);
				toast.success(`완료! ${item.title}`);
			}
			previousCompletionMap.set(item.id, item.isCompleted);
		}

		for (const [itemId] of previousCompletionMap) {
			if (!currentIds.has(itemId)) {
				previousCompletionMap.delete(itemId);
			}
		}
	});
</script>

<div class="flex h-full flex-col gap-4 overflow-auto p-4">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-bold">Daily Check</h1>
			<p class="text-sm text-muted-foreground">
				출석 항목 리스트를 중심으로 관리하고, 추가/웹푸시 설정은 팝업에서 처리합니다.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button onclick={openCreateModal}>출석 항목 추가</Button>
			<Button variant="outline" onclick={() => (isPushModalOpen = true)}>웹푸시 구독 설정</Button>
		</div>
	</div>

	{#if data.dbUnavailable}
		<div class="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
			데이터베이스 바인딩이 없어 Daily Check를 사용할 수 없습니다.
		</div>
	{:else}
		<div class="grid gap-3 rounded-md border p-4 md:grid-cols-4">
			<div class="rounded-md border p-3">
				<p class="text-xs text-muted-foreground">총 구독 항목</p>
				<p class="text-2xl font-semibold">{itemViews.length}</p>
			</div>
			<div class="rounded-md border p-3">
				<p class="text-xs text-muted-foreground">완료</p>
				<p class="text-2xl font-semibold">{completedCount}</p>
			</div>
			<div class="rounded-md border p-3">
				<p class="text-xs text-muted-foreground">미완료</p>
				<p class="text-2xl font-semibold">{remainingCount}</p>
			</div>
			<div class="rounded-md border p-3">
				<p class="text-xs text-muted-foreground">남은 예상 시간</p>
				<p class="text-2xl font-semibold">{remainingMinutes}분</p>
			</div>
		</div>

		{#if reminder}
			<div class="rounded-md border border-amber-400/60 bg-amber-50 p-3 text-sm">
				<p class="font-semibold">
					미완료 출석 {reminder.itemCount}개
					{#if reminder.totalEstimatedMinutes > 0}
						· 예상 {reminder.totalEstimatedMinutes}분
					{/if}
				</p>
				<p class="text-muted-foreground">
					현재 사이클 기준으로 아직 완료하지 않은 항목입니다.
				</p>
			</div>
		{:else if reminderError}
			<div class="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
				{reminderError}
			</div>
		{/if}

		<div class="grid gap-3">
			<div class="rounded-md border p-4">
				<div class="mb-3 flex items-center justify-between">
					<h2 class="text-lg font-semibold">구독 리스트</h2>
					<p class="text-sm text-muted-foreground">링크 방문 후 완료 체크를 켜 주세요.</p>
				</div>

				{#if sortedItemViews.length === 0}
					<div class="rounded-md border p-6 text-center text-muted-foreground">
						등록된 출석 항목이 없습니다.
					</div>
				{:else}
					<div class="grid gap-3">
						{#each sortedItemViews as item (item.id)}
							<div
								class="daily-item-card rounded-md border p-4"
								class:completed-item={item.isCompleted}
								class:celebrating-item={isCelebrating(item.id)}
							>
								<div class="flex items-start gap-4">
									<form
										method="post"
										action="?/toggleItemCompletion"
										use:enhance={createEnhanceHandler({ silentSuccess: true })}
										class="pt-1"
									>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="completed" value={item.isCompleted ? 'false' : 'true'} />
										<label class="flex cursor-pointer items-center justify-center" aria-label="완료 체크">
											<input
												type="checkbox"
												checked={item.isCompleted}
												onchange={onToggleCompleteChange}
												class="completion-checkbox"
											/>
										</label>
									</form>

									<div class="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
										<div class="flex min-w-0 flex-1 flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="font-semibold">{item.title}</span>
											<span class="rounded bg-muted px-2 py-0.5 text-xs">{getKindLabel(item.kind)}</span>
											<span class={`rounded px-2 py-0.5 text-xs ${getImportanceToneClass(item.importance)}`}>
												중요도 {getImportanceLabel(item.importance)}
											</span>
											{#if item.isCompleted}
												<span class="rounded bg-emerald-600 px-2 py-0.5 text-xs text-white">완료</span>
											{:else}
												<span class="rounded bg-amber-500 px-2 py-0.5 text-xs text-white">미완료</span>
											{/if}
										</div>
										{#if item.url}
											<a
												href={item.url}
												target="_blank"
												rel="noopener noreferrer"
												class="truncate text-sm underline decoration-dotted underline-offset-4"
											>
												{item.url}
											</a>
										{:else}
											<span class="text-sm text-muted-foreground">사이트 링크 없음</span>
										{/if}
										<p class="text-xs text-muted-foreground">
											활성 리셋 {item.activeResetTime} ({item.timeZone}) · 등록
											{item.resetTimes.join(', ')} · 다음 리셋까지 {item.minutesUntilReset}분
											{#if !item.isCompleted}
												· 리셋 후 {item.minutesPastReset}분 경과
											{/if}
											{#if item.estimatedMinutes !== null}
												· 예상 {item.estimatedMinutes}분
											{/if}
										</p>
										{#if item.notes}
											<p class="text-xs text-muted-foreground">{item.notes}</p>
										{/if}
									</div>

									<div class="flex flex-wrap items-center gap-2">
										<Button variant="outline" size="sm" onclick={() => openEditItem(item)}>
											수정
										</Button>

										<form
											method="post"
											action="?/deleteItem"
											use:enhance={createEnhanceHandler({ silentSuccess: true })}
											onsubmit={(event) => {
												if (!confirm('이 출석 항목을 삭제할까요?')) {
													event.preventDefault();
												}
											}}
										>
											<input type="hidden" name="id" value={item.id} />
											<Button type="submit" variant="destructive" size="sm">삭제</Button>
										</form>
									</div>
								</div>
								</div>

								{#if editingItemId === item.id}
									<form
										method="post"
										action="?/updateItem"
										use:enhance={createEnhanceHandler({ closeEditor: true })}
										class="mt-3 grid gap-4 rounded-md border bg-muted/20 p-3"
									>
										<input type="hidden" name="id" value={item.id} />
										<div class="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-2">
											<p class="text-sm font-semibold md:col-span-2">기본 정보</p>
											<label class="grid gap-1">
												<span class="text-sm">할 일 이름 *</span>
												<input
													name="title"
													class="rounded-md border px-3 py-2"
													required
													value={item.title}
													placeholder="예: 게임 일일 보상 수령"
												/>
											</label>
											<label class="grid gap-1">
												<span class="text-sm">항목 유형 *</span>
												<select
													name="kind"
													class="rounded-md border px-3 py-2"
													required
													bind:value={editingKind}
												>
													{#each data.kindOptions as option (option.value)}
														<option value={option.value}>{option.label}</option>
													{/each}
												</select>
											</label>
											<label class="grid gap-1">
												<span class="text-sm">중요도 *</span>
												<select
													name="importance"
													class="rounded-md border px-3 py-2"
													required
													bind:value={editingImportance}
												>
													{#each data.importanceOptions as option (option.value)}
														<option value={option.value}>{option.label}</option>
													{/each}
												</select>
											</label>
											<label class="grid gap-1 md:col-span-2">
												<span class="text-sm">
													접속 URL {isSiteVisitKind(editingKind) ? '*' : '(선택)'}
												</span>
												<input
													name="url"
													type="url"
													class="rounded-md border px-3 py-2"
													required={isSiteVisitKind(editingKind)}
													disabled={!isSiteVisitKind(editingKind)}
													value={item.url}
													placeholder="https://example.com/check-in"
												/>
												<p class="text-xs text-muted-foreground">
													사이트 접속 유형에서만 필수입니다.
												</p>
											</label>
										</div>

										<div class="grid gap-3 rounded-md border bg-background p-4">
											<div class="flex flex-wrap items-center justify-between gap-2">
												<div class="grid gap-1">
													<p class="text-sm font-semibold">리셋 설정</p>
													<p class="text-xs text-muted-foreground">리셋 시간을 여러 개 등록할 수 있습니다.</p>
												</div>
												<Button type="button" variant="outline" size="sm" onclick={addEditingResetTime}>
													시간 추가
												</Button>
											</div>
											{#each editingResetTimes as resetTime, resetIndex (`edit-${item.id}-${resetIndex}`)}
												<div class="grid items-end gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
													<label class="grid gap-1">
														<span class="text-sm">리셋 시간 {resetIndex + 1} *</span>
														<input
															name="resetTimes"
															class="w-full rounded-md border px-3 py-2"
															type="time"
															step="60"
															required
															value={resetTime}
															onchange={(event) =>
																updateEditingResetTime(
																	resetIndex,
																	(event.currentTarget as HTMLInputElement).value
																)}
														/>
													</label>
													<Button
														type="button"
														variant="outline"
														size="sm"
														disabled={editingResetTimes.length <= 1}
														onclick={() => removeEditingResetTime(resetIndex)}
													>
														삭제
													</Button>
												</div>
											{/each}
											<label class="grid max-w-sm gap-1">
												<span class="text-sm">기준 시간대 *</span>
												<input
													name="timeZone"
													class="rounded-md border px-3 py-2"
													required
													list="daily-check-time-zones"
													value={item.timeZone}
													placeholder="예: Asia/Seoul"
												/>
											</label>
										</div>

										<div class="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-2">
											<p class="text-sm font-semibold md:col-span-2">추가 정보</p>
											<label class="grid gap-1">
												<span class="text-sm">예상 소요 시간(분)</span>
												<input
													name="estimatedMinutes"
													type="number"
													min="1"
													max="1440"
													class="rounded-md border px-3 py-2"
													value={item.estimatedMinutes ?? ''}
													placeholder="예: 10"
												/>
											</label>
											<label class="grid gap-1 md:col-span-2">
												<span class="text-sm">메모 (선택)</span>
												<textarea
													name="notes"
													rows="2"
													class="rounded-md border px-3 py-2"
													placeholder="필요한 순서나 체크 조건을 적어두세요."
												>{item.notes ?? ''}</textarea>
											</label>
										</div>
										<div class="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												onclick={resetEditState}
											>
												취소
											</Button>
											<Button type="submit">저장</Button>
										</div>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<datalist id="daily-check-time-zones">
	{#each data.commonTimeZones as zone (zone)}
		<option value={zone}></option>
	{/each}
</datalist>

{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pb-6 pt-8"
		role="presentation"
		onclick={(event) => closeModalOnBackdrop(event, 'create')}
	>
		<div class="w-full max-w-3xl rounded-md border bg-background p-4 shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold">출석 항목 추가</h2>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						isCreateModalOpen = false;
						resetCreateFormState();
					}}
				>
					닫기
				</Button>
			</div>
			<form
				method="post"
				action="?/createItem"
				use:enhance={createEnhanceHandler({ closeCreateModal: true })}
				class="grid gap-4"
			>
				<div class="grid gap-3 rounded-md border p-4 md:grid-cols-2">
					<p class="text-sm font-semibold md:col-span-2">기본 정보</p>
					<label class="grid gap-1">
						<span class="text-sm">할 일 이름 *</span>
						<input
							name="title"
							class="rounded-md border px-3 py-2"
							required
							placeholder="예: 게임 일일 보상 수령"
						/>
					</label>
					<label class="grid gap-1">
						<span class="text-sm">항목 유형 *</span>
						<select
							name="kind"
							class="rounded-md border px-3 py-2"
							required
							bind:value={createKind}
						>
							{#each data.kindOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
					<label class="grid gap-1">
						<span class="text-sm">중요도 *</span>
						<select
							name="importance"
							class="rounded-md border px-3 py-2"
							required
							bind:value={createImportance}
						>
							{#each data.importanceOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
					<label class="grid gap-1 md:col-span-2">
						<span class="text-sm">
							접속 URL {isSiteVisitKind(createKind) ? '*' : '(선택)'}
						</span>
						<input
							name="url"
							class="rounded-md border px-3 py-2"
							type="url"
							required={isSiteVisitKind(createKind)}
							disabled={!isSiteVisitKind(createKind)}
							placeholder="https://example.com/check-in"
						/>
						<p class="text-xs text-muted-foreground">
							사이트 접속 유형에서만 필수입니다.
						</p>
					</label>
				</div>

				<div class="grid gap-3 rounded-md border p-4">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="grid gap-1">
							<p class="text-sm font-semibold">리셋 설정</p>
							<p class="text-xs text-muted-foreground">리셋 시간을 여러 개 등록할 수 있습니다.</p>
						</div>
						<Button type="button" variant="outline" size="sm" onclick={addCreateResetTime}>
							시간 추가
						</Button>
					</div>
					{#each createResetTimes as resetTime, resetIndex (`create-${resetIndex}`)}
						<div class="grid items-end gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
							<label class="grid gap-1">
								<span class="text-sm">리셋 시간 {resetIndex + 1} *</span>
								<input
									name="resetTimes"
									class="w-full rounded-md border px-3 py-2"
									type="time"
									step="60"
									required
									value={resetTime}
									onchange={(event) =>
										updateCreateResetTime(resetIndex, (event.currentTarget as HTMLInputElement).value)}
								/>
							</label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={createResetTimes.length <= 1}
								onclick={() => removeCreateResetTime(resetIndex)}
							>
								삭제
							</Button>
						</div>
					{/each}
					<label class="grid max-w-sm gap-1">
						<span class="text-sm">기준 시간대 *</span>
						<input
							name="timeZone"
							class="rounded-md border px-3 py-2"
							required
							value={data.defaultTimeZone}
							list="daily-check-time-zones"
							placeholder="예: Asia/Seoul"
						/>
					</label>
				</div>

				<div class="grid gap-3 rounded-md border p-4 md:grid-cols-2">
					<p class="text-sm font-semibold md:col-span-2">추가 정보</p>
					<label class="grid gap-1">
						<span class="text-sm">예상 소요 시간(분)</span>
						<input
							name="estimatedMinutes"
							class="rounded-md border px-3 py-2"
							type="number"
							min="1"
							max="1440"
							placeholder="예: 10"
						/>
					</label>
					<label class="grid gap-1 md:col-span-2">
						<span class="text-sm">메모 (선택)</span>
						<textarea
							name="notes"
							class="rounded-md border px-3 py-2"
							rows="2"
							placeholder="필요한 순서나 체크 조건을 적어두세요."
						></textarea>
					</label>
				</div>
				<div class="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							isCreateModalOpen = false;
							resetCreateFormState();
						}}
					>
						취소
					</Button>
					<Button type="submit">추가</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if isPushModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pb-6 pt-8"
		role="presentation"
		onclick={(event) => closeModalOnBackdrop(event, 'push')}
	>
		<div class="w-full max-w-xl rounded-md border bg-background p-4 shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold">웹푸시 구독 설정</h2>
				<Button variant="outline" size="sm" onclick={() => (isPushModalOpen = false)}>닫기</Button>
			</div>

			<div class="grid gap-3 rounded-md border p-3">
				<p class="text-sm">
					현재 권한: <strong>{notificationPermission}</strong>
				</p>
				<p class="text-sm">
					현재 구독 상태: <strong>{isPushSubscribed ? '활성' : '비활성'}</strong>
				</p>
				{#if !data.vapidPublicKey}
					<p class="text-sm text-destructive">서버에 `VAPID_PUBLIC_KEY`가 설정되지 않았습니다.</p>
				{/if}
				<div class="flex flex-wrap gap-2">
					<Button onclick={handleEnablePush} disabled={isNotificationBusy || !data.vapidPublicKey}>
						웹푸시 구독
					</Button>
					<Button
						variant="outline"
						onclick={handleDisablePush}
						disabled={isNotificationBusy || !isPushSubscribed}
					>
						웹푸시 해지
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.daily-item-card {
		position: relative;
		overflow: hidden;
		transition:
			transform 220ms ease,
			box-shadow 220ms ease,
			border-color 220ms ease;
	}

	.daily-item-card.completed-item {
		border-color: color-mix(in oklab, var(--color-primary) 45%, var(--color-border));
		background: color-mix(in oklab, var(--color-primary) 8%, var(--color-background));
	}

	.daily-item-card.celebrating-item {
		animation:
			daily-item-pop 380ms ease-out,
			daily-item-glow 1400ms ease-out;
	}

	.daily-item-card.celebrating-item::after {
		content: '';
		position: absolute;
		inset: -30%;
		background:
			radial-gradient(circle, rgb(253 224 71 / 35%) 0%, transparent 55%),
			radial-gradient(circle at 70% 30%, rgb(52 211 153 / 28%) 0%, transparent 50%),
			radial-gradient(circle at 25% 75%, rgb(45 212 191 / 26%) 0%, transparent 45%);
		animation: daily-item-burst 900ms ease-out forwards;
		pointer-events: none;
	}

	.completion-checkbox {
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		border-radius: 0.5rem;
		border: 2px solid color-mix(in oklab, var(--color-primary) 55%, var(--color-border));
		accent-color: rgb(16 185 129);
		box-shadow: 0 0 0 2px rgb(16 185 129 / 10%);
		transition:
			transform 140ms ease,
			box-shadow 140ms ease;
	}

	.completion-checkbox:hover {
		transform: scale(1.06);
		box-shadow: 0 0 0 3px rgb(16 185 129 / 20%);
	}

	.completion-checkbox:checked {
		transform: scale(1.12);
		box-shadow: 0 0 0 4px rgb(16 185 129 / 25%);
	}

	@keyframes daily-item-pop {
		0% {
			transform: scale(1);
		}
		45% {
			transform: scale(1.018);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes daily-item-glow {
		0% {
			box-shadow: 0 0 0 0 rgb(16 185 129 / 0%);
		}
		35% {
			box-shadow: 0 0 0 4px rgb(16 185 129 / 28%);
		}
		100% {
			box-shadow: 0 0 0 0 rgb(16 185 129 / 0%);
		}
	}

	@keyframes daily-item-burst {
		0% {
			opacity: 0.95;
			transform: scale(0.9);
		}
		100% {
			opacity: 0;
			transform: scale(1.2);
		}
	}
</style>
