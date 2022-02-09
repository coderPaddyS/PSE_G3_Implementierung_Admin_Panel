<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { TitleCell } from "$lib/model/table/TableComponents";
    import TableDataComp from "./TableDataComp.svelte";
    import TableSort from "./TableSort.svelte";

    // Generic Type T
    type T = $$Generic;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let cell: TitleCell<T>;
    export let index: Array<number>;
    export let size;
</script>

<style lang=scss>
    .titlecell {
        display: grid;
        grid-template-areas: "S C";
        grid-template-columns: 2em 1fr;
        
        font-size: x-large;
        font-family: 'New Century Schoolbook', 'Courier New', Courier, monospace;
        font-weight: 600;
        color: white;

        .sorter {
            grid-area: S-start;
            padding-right: 2em;
            height: 100%;
        }

        .data {
            grid-area: C-start;
            height: 100%;
        }
    }
</style>

{#if cell && !cell.isHidden()} 
    <div class=titlecell>
        {#if cell.getSorter()}
            <div class=sorter>
                <TableSort algorithm={cell.getSorter()} />
            </div>
        {/if}
        {#each cell.getChilds() as data, i}
            <div class=data>
                <TableDataComp {data} index={[...index, i]} {size} />
            </div>
        {/each}
    </div>
{/if}
