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
    export let styling;
</script>

<style lang=scss>

    @import '../../../../global.scss';
    .subtable-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-top: calc(0.25 * $table_margin);
        margin-bottom: calc(0.25 * $table_margin);
        padding: 0;
        background-color: $table_cell_bg_color;
        border-radius: $table_border_radius;
    }
</style>

{#if cell !== undefined && !cell.isHidden()} 
    <div class=subtable-cell>
        {#each cell.getChildren() as data, i}
            <TableDataComp bind:data={data} index={[...index, i]} {styling} />
        {/each}
    </div>
{/if}