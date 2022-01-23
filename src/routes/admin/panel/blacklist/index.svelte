<script lang=ts>
// import Cell from "$lib/components/table/Cell.svelte.txt";
// import Row from "$lib/components/table/Row.svelte";

    // import init, {TableData} from 'kifapwa';
    import { Table, Row, TitleRow, data, Cell, dataFilter, TableData, tableDisplayData } from "$lib/components/table/Table";

    import TableComp from "$lib/components/table/TableComp.svelte";
    // import TitleRow from "$lib/components/table/TitleRow.svelte.txt"

    let table: Table = 
        new Table().add(
            new TitleRow().add(
                new Cell(new TableData("Title")),
                new Cell(new TableData("Title")),
                new Cell(new TableData("Title")),
                new Cell(new TableData("Title"))
            ),
            new Row().add(
                new Cell(new TableData("Cell")),
                new Cell(new TableData("Cell")),
                new Cell(new TableData("Cell")),
                new Cell(
                    new Table().add(
                        new TitleRow().add(
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                        ),
                        new Row().add(
                            new Cell(new TableData("Cell")),
                            new Cell(new TableData("Cell")),
                            new Cell(new TableData("Cell")),
                            new Cell(new TableData("Cell"))
                        )
                    )
                )
            ),
            new Row().add(
                new Cell(new TableData("Cell")),
                new Cell(new TableData("Cell")),
                new Cell(new TableData("Cell")),
                new Cell(
                    new Table().add(
                        new TitleRow().add(
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                            new Cell(new TableData("Title")),
                        ),
                        new Row().add(
                            new Cell(new TableData("Value")),
                            new Cell(new TableData("Value")),
                            new Cell(new TableData("Value")),
                            new Cell(new TableData("Value"))
                        )
                    )
                )
            )
        )
    data.set(table)
    let filter = "";
    let displayData;
    dataFilter.set((a: TableData) => {
        return true
    })

    $: dataFilter.set((a: TableData) => {
        return a.data.includes(filter)
    })
    $: console.log($tableDisplayData, "abc")
    // onMount(() => {
    //     data.createHTML(document.getElementById('table'))
    // })
</script>

<!-- {@debug $data} -->
<button on:click={() => data.update(table => table.add(                        new Row().add(
    new Cell(new TableData("Value")),
    new Cell(new TableData("Value")),
    new Cell(new TableData("Value")),
    new Cell(new TableData("Value"))
)))}> Add row </button>
<input bind:value={filter} />
<TableComp data={[$tableDisplayData]} size=5em/>