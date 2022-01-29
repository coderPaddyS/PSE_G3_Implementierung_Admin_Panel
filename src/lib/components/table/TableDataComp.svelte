<script lang=ts>
    import { getContext, onMount } from "svelte";
    import { crawlerKey } from "$lib/model/table/Types";
    import { TableDataAdditions } from "$lib/model/table/TableDataAdditions";

    import type { iTableData } from "$lib/model/table/TableComponents";

    type T = $$Generic;

    export let data: iTableData<T>;
    export let index: Array<number>;

    let root: HTMLElement;

    const { crawlOnView } = getContext(crawlerKey);

    onMount(async () => {
        if (data.type == TableDataAdditions.COMPONENT) {
            data.factory(root, {
                index,
                crawlOnView,
            });
        }
        // if (containsComponent) {
            // let matches = ["/src/lib/components/table_actions/Blacklist.svelte"];
            // console.log(matches);
            // for (let component in matches) {
            //     let comp = import(/* @vite-ignore */ component)
            //     components.push(comp);
            //     console.log(comp)
            // }
        // }
    })

</script>

<style lang=scss>

</style>

{#if data.type == TableDataAdditions.HTML}
    {@html data.data}
<!-- {console.log(components)}
{#each components as component}
        {#await component}
        {:then comp}
            <svelte:component this={comp.default} />
        {/await}
    {/each} -->
{:else if data.type == TableDataAdditions.COMPONENT}
    <div id=component bind:this={root} />
{:else}
    {data.data}
{/if}

