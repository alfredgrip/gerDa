<script lang="ts">
    import HandlingForm from "./HandlingForm.svelte";
    import MotionForm from "./MotionForm.svelte";
    import PropositionForm from "./PropositionForm.svelte";

    const forms = [
        { id: 1, label: "Motion", component: MotionForm },
        { id: 2, label: "Proposition", component: PropositionForm },
        { id: 3, label: "Handling", component: HandlingForm },
    ];

    export let activeForm: number = 1;
</script>

<h2>Jag vill skapa en ...</h2>

<div class="button-group">
    {#each forms as form, i}
        <button
            class:selected={activeForm === form.id}
            on:click={() => {
                activeForm = form.id;
                console.log(activeForm);
            }}>{form.label}</button
        >
    {/each}
</div>

<div class="form-container {[activeForm === 1 ? 'active' : 'hidden']}">
    <MotionForm />
</div>
<div class="form-container {[activeForm === 2 ? 'active' : 'hidden']}">
    <PropositionForm />
</div>
<div class="form-container {[activeForm === 3 ? 'active' : 'hidden']}">
    <HandlingForm />
</div>

<style>
    div {
        background-color: rgb(248, 248, 248);
        border-radius: 10px;
        padding: 20px;
        margin: 20px;
        display: flex;
        gap: 20px;
        border: 1px solid black;
    }

    .form-container {
        display: none;
    }

    .active {
        display: block;
    }

    .hidden {
        display: none;
    }
</style>
