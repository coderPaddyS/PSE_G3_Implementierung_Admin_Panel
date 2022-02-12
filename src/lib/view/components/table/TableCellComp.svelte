<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { TableCell } from "$lib/model/recursive_table/TableComponents";
    import TableDataComp from "./TableDataComp.svelte";

    // Generic Types: 
    //      C extends TableCell<T>
    type T = $$Generic;
    type C = $$Generic<TableCell<T>>;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let cell: C;
    export let index: Array<number>;
    export let size;
</script>

<style lang=scss>
    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: max-content;
        margin-top: auto;
        margin-bottom: auto;
    }
</style>

{#if cell !== undefined && !cell.isHidden()} 
    <div class=cell>
        {#each cell.getChildren() as data, i}
            <TableDataComp bind:data={data} index={[...index, i]} {size} />
        {/each}
    </div>
{/if}