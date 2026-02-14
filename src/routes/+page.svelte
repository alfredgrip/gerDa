<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { DocumentClass } from '$lib/schemas';
	import { draftStore } from '$lib/state/localDraftsState.svelte';

	const localDrafts = $derived(draftStore);

	const ROUTES: Record<
		DocumentClass,
		{ name: string; explanation: string; path: ResolvedPathname }
	> = {
		motion: {
			name: 'Motion',
			explanation:
				'En motion är ett förslag som kommer från en eller flera sektionsmedlemmar, ibland ett helt utskott.',
			path: '/create/motion'
		},

		proposition: {
			name: 'Proposition',
			explanation: 'En proposition är ett förslag som kommer från styrelsen.',
			path: '/create/proposition'
		},

		'styrelsens-svar': {
			name: 'Styrelsens svar',
			explanation: 'Styrelsens svar är ett svar från styrelsen på en motion.',
			path: '/create/styrelsens-svar'
		},
		kravprofil: {
			name: 'Kravprofil',
			explanation:
				'En kravprofil beskriver vilka krav och meriter som en viss post har, och används av valberedningen under valprocessen.',
			path: '/create/kravprofil'
		},
		valförslag: {
			name: 'Valförslag',
			explanation:
				'Ett valförslag är dokumentet där en valberedning presenterar vilka kandidater som föreslås till ett visst val.',
			path: '/create/valförslag'
		},
		kallelse: {
			name: 'Kallelse',
			explanation:
				'En kallelse är en formell inbjudan till ett möte. Innehåller tid, plats, och eventuellt dagordning för mötet.',
			path: '/create/kallelse'
		},
		handling: {
			name: 'Handling',
			explanation:
				'En handling är ett mer generiskt dokument till ett möte. Används lite hur man vill så man kan skriva en liten chill handling.',
			path: '/create/handling'
		},
		custom: {
			name: 'Anpassat dokument',
			explanation:
				'Om inget av de andra passar kan du göra ett eget anpassat dokument. Mindre bestämt format, mer frihet.',
			path: '/create/custom'
		}
	};

	const recentDrafts = $derived(
		[...localDrafts.drafts].sort((a, b) => b.lastEdit - a.lastEdit).slice(0, 3)
	);
</script>

<div class="bg-dsek-highlight min-h-screen">
	<header class="px-8 py-10 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl text-center">
			<h1 class="text-4xl font-extrabold tracking-tight">Skapa dokument</h1>
		</div>
	</header>

	<main class="mx-auto max-w-7xl p-8">
		{#if localDrafts.drafts.length > 0}
			<section class="mb-12">
				<div class="mb-4 flex items-center justify-between px-2">
					<h2 class="text-sm font-bold tracking-widest uppercase">Dina senaste utkast</h2>
					<a href="/drafts" class="p-2 text-sm font-semibold hover:underline">
						Visa alla utkast ({localDrafts.drafts.length}) →
					</a>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{#each recentDrafts as draft}
						<a
							href="/create/{draft.documentClass}"
							onclick={() => (draftStore.currentDraftId = draft.id)}
							class="hover:border-dsek bg-dsek-pale flex items-center gap-4 rounded-xl border-2 border-transparent p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
						>
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl">
								📄
							</div>
							<div class="min-w-0">
								<h3 class="text-md truncate font-bold">{draft.title || 'Namnlöst utkast'}</h3>
								<p class="text-xs tracking-tighter uppercase">
									{draft.documentClass.replace('-', ' ')}
								</p>
							</div>
							<div
								class="ml-auto rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800"
							>
								{new Date(draft.lastEdit).toLocaleDateString('sv-SE', {
									month: 'short',
									day: 'numeric',
									year: 'numeric'
								})}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<div class="mb-6 px-2">
			<h2 class="text-sm font-bold tracking-widest uppercase">Mallar</h2>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each Object.values(ROUTES) as { name, path, explanation } (name)}
				<a
					href={path}
					onclick={() => (localDrafts.currentDraftId = null)}
					class="group hover:border-dsek bg-dsek-pale relative flex flex-col justify-between rounded-2xl border-2 border-transparent p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
				>
					<div>
						<h3 class="text-xl font-bold">{name}</h3>
						<p class="mt-2 text-sm leading-relaxed opacity-60">{explanation}</p>
					</div>
				</a>
			{/each}
		</div>
	</main>
</div>
