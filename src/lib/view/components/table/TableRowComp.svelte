<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { TableRow } from "$lib/model/recursive_table/TableComponents";
    import TableCellComp from "./TableCellComp.svelte";
    import cssVars from "svelte-css-vars"

    // Generic Types: 
    //     R extends TableRow<T>
    type T = $$Generic;
    type R = $$Generic<TableRow<T>>

    // Data provided externally to provide the possiblity to add custom behaviour
    export let row: R;
    export let index: Array<number>;
    export let styling;

    // Update te styleVars if size is changing to update the css variable
    $: styleVars = {
        size: styling
    }
</script>

<style lang=scss>

    @import '../../../../global.scss';
    .row {
        width: auto;
        display: grid;
        gap: $table_gap;
        @include rowColumnTemplate();
        @include mobile() {
            background-color: $table_bg_color;
            border-radius: 1em;
            padding: $table_padding;
            margin-top: calc(0.5 * $table_margin);
            margin-bottom: calc(0.5 * $table_margin);
        }
    }
</style>

{#if row && !row.isHidden() && row.getChildren()} 
    <div class=row use:cssVars={styleVars}>
        {#each row.getChildren() as cell, i}
            <TableCellComp bind:cell={cell} index={[...index, i]} {styling}/>
        {/each}
    </div>
{/if}