<script lang=ts>
    import cssVars from "svelte-css-vars"
    import { get } from "svelte/store";
    import type { iTableCell, iTableComponent, iTableRow, Table } from "./Table";

    export let size;
    export let data: iTableComponent[];
    $: styleVars = {
        size: size
    }
</script>

<style lang=scss>
    .table {
        width: 100%;
        justify-content: center;
        align-items: center;
        background-color: #b00b69;
    }

    .titlerow {
        border-radius: 1em;
        background-color: #55c2dd;

        :global(.cell) {
            font-size: x-large;
            font-family: 'New Century Schoolbook', 'Courier New', Courier, monospace;
            font-weight: 600;
            color: white;
        }
    }

    .titlerow, .row {
        width: auto;
        display: grid;
        padding: 1em;
        grid-template-columns: repeat(auto-fit, minmax(var(--size), 1fr));
    }

    .cell {
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>

{#each data as entry}
    {#if entry !== undefined}
        <div class={entry.comp} use:cssVars={styleVars}>
            {#if entry.comp} 
                <svelte:self data={entry.data} {size}/>
            {:else}
                {entry.data}
            {/if}
        </div>
    {/if}
{/each}