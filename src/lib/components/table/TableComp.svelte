<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import cssVars from "svelte-css-vars"
    import { eTableData, iTableComponent } from "./Types";
    import TableSort from "./TableSort.svelte";

    // Alter the minimum size of a column
    export let size;
    export let data: iTableComponent[];

    // Apply dynamic changes of size
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

    .titlecell {
        display: grid;
        grid-template-columns: 1fr 2em;
        padding-left: 2em;

        :global(.data) {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }

    .cell {
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>

<!-- Traverse each child of the current iTableComponent -->
{#each data as entry}
    {#if entry !== undefined}

        <div class={entry.comp} use:cssVars={styleVars}>
            <!-- If it is not a eTableData.Data Element, then it has childrens -->
            {#if entry.comp != eTableData.Data} 

                <!-- Therefore create a new TableComp child component with the child -->
                <svelte:self data={entry.data} {size}/>

                <!-- If it has a sorting algrotihm, then add a TableSort component -->
                {#if entry.sorter}
                    <TableSort algorithm={entry.sorter} />
                {/if}
            
            <!-- If it is TableData, display it -->
            {:else}
                {entry.data}
            {/if}
        </div>
    {/if}
{/each}