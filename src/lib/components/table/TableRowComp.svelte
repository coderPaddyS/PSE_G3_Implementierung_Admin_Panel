<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { TableRow } from "$lib/model/table/TableComponents";
    import TableCellComp from "./TableCellComp.svelte";
    import cssVars from "svelte-css-vars"

    // Generic Types: 
    //     R extends TableRow<T>
    type T = $$Generic;
    type R = $$Generic<TableRow<T>>

    // Data provided externally to provide the possiblity to add custom behaviour
    export let row: R;
    export let index: Array<number>;
    export let size;

    // Update te styleVars if size is changing to update the css variable
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

{#if row !== undefined && !row.isHidden()} 
    <div class=row use:cssVars={styleVars}>
        {#each row.getChilds() as cell, i}
            <TableCellComp bind:cell={cell} index={[...index, i]} {size}/>
        {/each}
    </div>
{/if}