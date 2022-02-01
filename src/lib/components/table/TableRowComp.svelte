<script lang=ts>
import type { TableCell, TableRow } from "$lib/model/table/TableComponents";
import TableCellComp from "./TableCellComp.svelte";
import cssVars from "svelte-css-vars"

    type T = $$Generic;
    type R = $$Generic<TableRow<T>>
    export let row: R;
    export let index: Array<number>;
    export let size;
    let root: HTMLElement;

    $: styleVars = {
        size: size
    }
</script>

<style lang=scss>
    .row {
        width: auto;
        display: grid;
        padding: 1em;
        grid-template-columns: repeat(auto-fit, minmax(var(--size), 1fr));
    }
</style>

{#if row !== undefined} 
    <div class=row use:cssVars={styleVars}>
        {#each row.getChilds() as cell, i}
            <TableCellComp bind:cell={cell} index={[...index, i]} {size}/>
        {/each}
    </div>
{/if}