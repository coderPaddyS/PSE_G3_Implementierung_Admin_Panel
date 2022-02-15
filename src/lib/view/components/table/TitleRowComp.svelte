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
    export let size;

    // apply changes to size to css
    $: styleVars = {
        size
    }
</script>

<style lang=scss>
    .titlerow {
        width: auto;
        display: grid;
        padding: 1em;
        grid-template-columns: repeat(auto-fit, minmax(var(--size), 1fr));

        border-radius: 1em;
        background-color: #55c2dd;
    }
</style>

{#if row && !row.isHidden() && row.getChildren()} 
    <div class=titlerow use:cssVars={styleVars}>
        {#each row.getChildren() as cell, i}
            <TitleCellComp {cell} index={[...index, i]} {size}/>
        {/each}
    </div>
{/if}