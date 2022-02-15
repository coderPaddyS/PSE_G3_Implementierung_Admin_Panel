<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { TitleRow } from "$lib/model/recursive_table/TableComponents";
    import TitleCellComp from "./TitleCellComp.svelte";
    import cssVars from "svelte-css-vars"

    // Generic Type T
    type T = $$Generic;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let row: TitleRow<T>;
    export let index: Array<number>;
    export let styling;

    // apply changes to size to css
    $: styleVars = {
        size: styling
    }
</script>

<style lang=scss>

    @import '../../../../global.scss';
    .titlerow {
        width: auto;
        display: grid;
        gap: $table_gap;
        @include rowColumnTemplate();
        padding: $table_padding;
        border-radius: 1em;
        background-color: #55c2dd;
    }
</style>

{#if row && !row.isHidden() && row.getChildren()} 
    <div class=titlerow use:cssVars={styleVars}>
        {#each row.getChildren() as cell, i}
            <TitleCellComp {cell} index={[...index, i]} {styling}/>
        {/each}
    </div>
{/if}