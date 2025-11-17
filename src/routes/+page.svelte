<script lang="ts">
	import { DOCUMENT_CLASSES, type DocumentClass } from '$lib/schemas';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

	const localDrafts = getLocalStorageDrafts();

	const DOCUMENT_INFO: Record<DocumentClass, { name: string; explanation: string }> = {
		motion: {
			name: 'Motion',
			explanation:
				'En motion är ett förslag som kommer från en eller flera sektionsmedlemmar, ibland ett helt utskott.'
		},
		proposition: {
			name: 'Proposition',
			explanation: 'En proposition är ett förslag som kommer från styrelsen.'
		},
		'styrelsens-svar': {
			name: 'Styrelsens svar',
			explanation: 'Styrelsens svar är ett svar från styrelsen på en motion.'
		},
		kravprofil: {
			name: 'Kravprofil',
			explanation:
				'En kravprofil beskriver vilka krav och meriter som en viss post har, och används av valberedningen under valprocessen.'
		},
		valförslag: {
			name: 'Valförslag',
			explanation:
				'Ett valförslag är dokumentet där valberedningen presenterar vilka kandidater som föreslås till ett visst val.'
		},
		kallelse: {
			name: 'Kallelse',
			explanation: 'En kallelse är en inbjudan till ett möte eller en sammankomst.'
		},
		custom: {
			name: 'Anpassat dokument',
			explanation:
				'Ett anpassat dokument används för något som inte passar in i de andra kategorierna, t.ex. en egen handling till ett möte.'
		}
	};

	const routes = DOCUMENT_CLASSES.map((type) => ({
		type,
		name: DOCUMENT_INFO[type].name,
		path: `/create/${type}`,
		explanation: DOCUMENT_INFO[type].explanation
	}));
</script>

<div class="flex min-h-screen flex-col items-center gap-12 bg-[rgb(248,184,201)] p-8">
	<h1 class="text-4xl font-bold text-gray-800">Skapa dokument</h1>

	<!-- Document type cards -->
	<div class="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each routes as { name, path, explanation, type } (type)}
			<a
				href={path}
				onclick={() => (localDrafts.currentDraftId = null)}
				class="group block transform rounded-xl bg-pink-100 p-6 shadow-lg transition-transform hover:-translate-y-1 hover:bg-pink-50 hover:shadow-2xl"
			>
				<h2 class="mb-2 text-2xl font-bold text-gray-800 group-hover:text-pink-600">{name}</h2>
				<p class="text-sm text-gray-600">{explanation}</p>
			</a>
		{/each}
	</div>

	<!-- Drafts section -->
	{#if localDrafts.drafts.length > 0}
		<div>
			<div class="mt-12 w-full max-w-md">
				<h2 class="mb-4 text-center text-2xl font-bold text-gray-800">Utkast</h2>
				<a
					href="/drafts"
					class="block w-full rounded-md bg-pink-100 p-4 text-center text-xl text-gray-800 shadow transition-colors duration-150 hover:bg-gray-100"
				>
					Hantera utkast
				</a>
			</div>
		</div>
	{/if}
</div>
