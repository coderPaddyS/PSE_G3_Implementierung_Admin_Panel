<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { Table } from "$lib/model/recursive_table/TableComponents";
    import SubTableRowComp from "./SubTableRowComp.svelte";
    import TitleRowComp from "./TitleRowComp.svelte";

    // Generic Type T 
    type T = $$Generic;
    type TA = $$Generic<Table<T>>;

    // A styling variable to alter sizes simultaneously
    export let styling;
    export let table: TA;
    export let index: Array<number>;
</script>

<style lang=scss>
    @import '../../../../global.scss';

    .subtable {
        width: 100%;
        justify-content: center;
        align-items: center;        
    }
</style>

{#if table !== undefined && !table.isHidden()}
    <div class=subtable>
        {#if table.getTitle()}
            <TitleRowComp row={table.getTitle()} index={[...index, 0]} {styling}/>
        {/if}
        {#if table.getChildren()}
            {#each table.getChildren() as row,i}
                <SubTableRowComp bind:row={row} index={[...index, i]} {styling} />
            {/each}
        {/if}
    </div>
{/if}