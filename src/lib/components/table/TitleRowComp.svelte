<script lang=ts>
import type { TitleRow } from "$lib/model/table/TableComponents";
import TitleCellComp from "./TitleCellComp.svelte";
import cssVars from "svelte-css-vars"

    type T = $$Generic;
    export let row: TitleRow<T>;
    export let index: Array<number>;
    export let size;

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

{#if row !== undefined} 
    <div class=titlerow use:cssVars={styleVars}>
        {#each row.getChilds() as cell, i}
            <TitleCellComp {cell} index={[...index, i]} {size}/>
        {/each}
    </div>
{/if}