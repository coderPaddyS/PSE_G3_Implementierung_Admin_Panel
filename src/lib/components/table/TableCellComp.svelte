<script lang=ts>
import type { TableCell } from "$lib/model/table/TableComponents";
import TableDataComp from "./TableDataComp.svelte";



    type T = $$Generic
    type C = $$Generic<TableCell<T>>

    export let cell: C;
    export let index: Array<number>;
    export let size;
</script>

<style lang=scss>
    .cell {
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>

{#if cell !== undefined} 
    <div class=cell>
        {#each cell.getChilds() as data, i}
            <TableDataComp bind:data={data} index={[...index, i]} {size} />
        {/each}
    </div>
{/if}