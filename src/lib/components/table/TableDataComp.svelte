<script lang=ts>
    import { getContext, onMount } from "svelte";
    import { crawlerKey } from "$lib/model/table/Types";
    import { TableDataAdditions } from "$lib/model/table/TableDataAdditions";

    import type { Table, TableData } from "$lib/model/table/TableComponents";
    import TableComp from "./TableComp.svelte";

    type T = $$Generic;

    export let data: TableData<T>;
    export let index: Array<number>;
    export let size;

    let root: HTMLElement;

    const { crawlOnView } = getContext(crawlerKey);

    let factory = (root: HTMLElement, props: Object) => new TableComp({
        target: root,
        props: {
            size,
            ...props
        }
    });

    // $: if (root) {
    //     data.render(root, {index, crawlOnView}, factory)
    // };

    function toTable(data: TableData<T>): Table<T> {
        return data.getData()[0] as unknown as Table<T>
    }

    onMount(() => {
        if (data.getType() == TableDataAdditions.COMPONENT) {
            data.getFactory()(root, {
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
    .data {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>
{#if data !== undefined} 
    <div class=data bind:this={root}>
        {#if data.getType() == TableDataAdditions.HTML}
            {@html data.getData()}
        {:else if data.getType() == TableDataAdditions.COMPONENT}
            <div id=component bind:this={root} />
        {:else if data.getType() == TableDataAdditions.TABLE}
            <TableComp table={toTable(data)} {size} />
        {:else}
            {data.getData()}
        {/if}
    </div>
{/if}


