<script lang=ts>
    import type { Table } from "$lib/model/table/TableComponents";
    import SvelteTable from "$lib/components/table/SvelteTable.svelte"
    import FilterElement from "$lib/components/table/FilterElement.svelte";
    import { Framework } from "$lib/controller/framework";

    
    let table: Table<string> = Framework.getInstance().getBlacklist();
    // Framework.getInstance().onBlacklistUpdate((newTable: Table<string>) => {
    //     table = newTable;
    // });

    let framework = Framework.getInstance();

    let filterOptions: Map<String, String> = new Map([["Filter", "Option"], ["Filter2", "Option2"]])
</script>

<!-- Currently just debug stuff so ignore, just proof of concept -->
<!-- <button on:click={() => {
    counter++;
    table = table.add(new Row().add(
    new Cell(new TableData("A Value" + counter)),
    new Cell(new TableData("A Value" + (10 - counter))),
    new Cell(new TableData("A Value")),
    new Cell(new TableData("A Value"))
    ))
    }}> Add row </button> -->

<FilterElement {filterOptions} />
<SvelteTable supplier={() => framework.getBlacklist()} updater={(listener) => framework.onBlacklistUpdate(listener)} size=5em />