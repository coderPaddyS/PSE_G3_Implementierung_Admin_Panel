<script lang=ts>
    import type { TableRow, TitleCell } from "$lib/model/table/TableComponents";
import type { Sorter } from "$lib/model/table/Types";
import TableDataComp from "./TableDataComp.svelte";
import TableSort from "./TableSort.svelte";

    type T = $$Generic;
    export let cell: TitleCell<T>;
    let sorter: Sorter<TableRow<T>> = cell.getSorter();
    export let index: Array<number>;
    export let size;
</script>

<style lang=scss>
    .titlecell {
        display: grid;
        grid-template-columns: 1fr 2em;
        padding-left: 2em;
        
        font-size: x-large;
        font-family: 'New Century Schoolbook', 'Courier New', Courier, monospace;
        font-weight: 600;
        color: white;
    }
</style>

{#if cell !== undefined} 
    <div class=titlecell>
        {#each cell.getChilds() as data, i}
            <TableDataComp {data} index={[...index, i]} {size} />
        {/each}
        {#if sorter}
            <TableSort algorithm={sorter} />
        {/if}
    </div>
{/if}
