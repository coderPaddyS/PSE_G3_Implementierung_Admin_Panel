<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { getContext, onMount, SvelteComponent } from "svelte";
    import { crawlerKey } from "$lib/model/recursive_table/Types";
    import { TableDataAdditions } from "$lib/model/recursive_table/TableDataAdditions";

    import type { TableData } from "$lib/model/recursive_table/TableComponents";
    import TableComp from "./TableComp.svelte";

    // Generic Type T
    type T = $$Generic;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let data: TableData<T>;
    export let index: Array<number>;
    export let size;

    // Render Components as a child to this element
    let root: HTMLElement;
    let comp: SvelteComponent = undefined;

    // Rerender the component if data changes.
    // Only evaluates to true if data is of Type TableDataComp as root only binds in this case.
    // Only needed because svelte does not rerender the childcomponent as its data never changes.
    // Even if everything else changes in the surrounding
    $: if (root && data && comp && data.getFactory() && !data.isHidden()) {
        comp.$destroy();
        comp = data.getFactory()(root, {
                index,
                crawlOnView,
        });
    }

    // Pass the crawlOnView method to the child component to provide the possibility to add custom behaviour
    const { crawlOnView } = getContext(crawlerKey);

    onMount(() => {
        if (data.getType() == TableDataAdditions.COMPONENT && data.getFactory() && !data.isHidden()) {
            
            // Create the component, TableData::getFactory returns a function object,
            // on which the function can be called on directly.
            comp = data.getFactory()(root, {
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
        {#if data.getType() == TableDataAdditions.HTML && data.getData()}
            {@html data.getData()}
        {:else if data.getType() == TableDataAdditions.COMPONENT}
            <div class=component bind:this={root} />
        {:else if data.getType() == TableDataAdditions.TABLE && data.getChildren()}
            <TableComp table={data.getChildren()[0]} {size} />
        {:else}
            {data.getData()? data.getData() : ""}
        {/if}
    </div>
{/if}
