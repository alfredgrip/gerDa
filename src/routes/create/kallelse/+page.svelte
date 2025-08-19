<script>
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import DocumentClassInput from '$lib/components/DocumentClassInput.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getAgendaContext } from '$lib/state/agendaState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
	formState.documentClass = 'kallelse';

	let adjourn = $state(false);
	let includeAgenda = $state(false);

	let agendaState = getAgendaContext();
	let agendaItems = $state(agendaState.items);

	// TODO
</script>

<DocumentClassInput bind:documentClass={formState.documentClass} />

<ResizingTextInput
	name="meeting"
	label="Möte"
	placeholder="Ex. S02, HTM-val, VTM1, SRD13"
	bind:value={formState.title}
/>

<div class="flex flex-row space-x-4">
	<div>
		<input
			type="radio"
			id="board"
			name="meetingType"
			value="styrelsemöte"
			bind:group={formState.meetingType}
		/>
		<label for="board">Styrelsemöte</label>
	</div>
	<div>
		<input
			type="radio"
			id="guild"
			name="meetingType"
			value="sektionsmöte"
			bind:group={formState.meetingType}
		/>
		<label for="guild">Sektionsmöte</label>
	</div>
	<div>
		<input
			type="radio"
			id="srd"
			name="meetingType"
			value="studierådsmöte"
			bind:group={formState.meetingType}
		/>
		<label for="srd">Studierådsmöte</label>
	</div>
</div>

<div class="date-place-time">
	<div class="date-and-time">
		<label for="date">Datum && Tid</label>
		<input
			type="datetime-local"
			id="meetingDate"
			name="meetingDate"
			bind:value={formState.meetingDate}
		/>
	</div>
	<ResizingTextInput
		name="meetingPlace"
		label="Plats"
		placeholder="Ex. E:1124, E:A"
		bind:value={formState.meetingPlace}
	/>
</div>

<div>
	<input type="checkbox" id="adjourn" name="adjourn" bind:checked={adjourn} />
	<label for="adjourn">Ajournering?</label>
	{#if adjourn}
		<div style="display: flex; justify-content: flex-start; gap: 1rem;">
			<div style="display: flex; flex-direction: column;">
				<label for="date">Datum && Tid</label>
				<input
					type="datetime-local"
					id="adjournmentDate"
					name="adjournmentDate"
					bind:value={formState.adjournmentDate}
					style="width: 12rem; border: 1px solid rgb(209, 209, 209); border-radius: 0.5rem; padding: 0.5rem;"
					required
				/>
			</div>
			<ResizingTextInput
				name="adjournmentPlace"
				label="Plats"
				placeholder="Ex. E:1124, E:A"
				bind:value={formState.adjournmentPlace}
			/>
		</div>
	{/if}
</div>

<ResizingTextInput
	name="body"
	label="Brödtext"
	numRows={2}
	explanation="Brödtexten kan beskriva bakgrunden till mötet, men brukar ofta utelämnas"
	bind:value={formState.body}
/>

<div>
	<input type="checkbox" id="includeAgenda" name="includeAgenda" bind:checked={includeAgenda} />
	<label for="includeAgenda">Inkludera föredragningslista?</label>
	<small
		><p>
			Föredragningslista ska finnas med vid kallelse av styrelsemöte, men inte sektionsmöte
		</p></small
	>
	{#if includeAgenda}
		<div>
			<label>
				Punkter på föredragningslistan
				<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
					<p>Ärende</p>
					<p>Åtgärd</p>
					<p>Bilagor <small>(semikolon-separerad lista)</small></p>
				</div>
				{#each agendaItems as agendaItem, i (i)}
					<div class="agenda-div">
						<div class="inner-agenda-div">
							<ResizingTextInput
								name={`agenda-item-${i.toString()}-title`}
								bind:value={agendaItem.title}
								label=""
								placeholder="OFMÖ"
							/>
							<ResizingTextInput
								name={`agenda-item-${i.toString()}-type`}
								bind:value={agendaItem.type}
								label=""
								placeholder="Beslut, diskussion, information"
							/>
							<ResizingTextInput
								name={`agenda-item-${i.toString()}-attachments`}
								bind:value={agendaItem.attachments}
								label=""
								placeholder="minio.api.dsek.se/..."
							/>
						</div>
						{#if i !== 0}
							<button onclick={() => agendaState.removeItem(i)}>
								Ta bort punkt {(i + 1).toString()}
							</button>
						{/if}
					</div>
				{/each}
				<button type="button" onclick={agendaState.addItem}> Lägg till punkt </button>
			</label>
		</div>
	{/if}
</div>

<AuthorBlock />
