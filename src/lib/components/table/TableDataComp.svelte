<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { getContext, onMount } from "svelte";
    import { crawlerKey } from "$lib/model/table/Types";
    import { TableDataAdditions } from "$lib/model/table/TableDataAdditions";

    import type { TableData } from "$lib/model/table/TableComponents";
    import TableComp from "./TableComp.svelte";

    // Generic Type T
    type T = $$Generic;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let data: TableData<T>;
    export let index: Array<number>;
    export let size;

    // Render Components as a child to this element
    let root: HTMLElement;

    // Pass the crawlOnView method to the child component to provide the possibility to add custom behaviour
    const { crawlOnView } = getContext(crawlerKey);

    onMount(() => {
        if (data.getType() == TableDataAdditions.COMPONENT) {
            
            // Create the component, TableData::getFactory returns a function object,
            // on which the function can be called on directly.
            data.getFactory()(root, {
                index,
                crawlOnView,
            });
        }
    })

</script>

<style lang=scss>
    .data {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%;
        height: 100%;

        .component {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
</style>
{#if data !== undefined && !data.isHidden()} 
    <div class=data>
        <!-- Switch over the types. Since Typescript has no dynamic binding, this is the most suiting
             solution to maintain the three-tier architecture -->
        {#if data.getType() == TableDataAdditions.HTML}
            {@html data.getData()}
        {:else if data.getType() == TableDataAdditions.COMPONENT}
            <div class=component bind:this={root} />
        {:else if data.getType() == TableDataAdditions.TABLE}
            <TableComp table={data.getChilds()[0]} {size} />
        {:else}
            {data.getData()}
        {/if}
    </div>
{/if}
