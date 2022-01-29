<script lang=ts>
    import { Table, Row, TitleRow, Cell, TableData, TitleCell } from "$lib/components/table/Types";
    import type { iTableRow } from "$lib/components/table/Types"
    import SvelteTable from "$lib/components/table/SvelteTable.svelte"
    import type { Sorter } from "$lib/components/table/Store";

    // A rudimentary implementation to sort the table lexicographically
    let sorter: Sorter<iTableRow> = (a: iTableRow, b: iTableRow) => {
        if (a.data[0].data[0].data > b.data[0].data[0].data) {
            return [b,a]
        } else {
            return [a, b]
        }
    }

    let counter = 0;
    let table: Table<iTableRow> = 
        new Table<iTableRow>().add(
            new TitleRow().add(
                new TitleCell(new TableData("Title"), sorter),
                new TitleCell(new TableData("Title"), sorter),
                new TitleCell(new TableData("Title"), sorter),
                new TitleCell(new TableData("Title"))
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
                new Cell(new TableData("Cell 2")),
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
        );
</script>

<!-- Currently just debug stuff so ignore, just proof of concept -->
<button on:click={() => {
    counter++;
    table = table.add(new Row().add(
    new Cell(new TableData("A Value" + counter)),
    new Cell(new TableData("A Value" + (10 - counter))),
    new Cell(new TableData("A Value")),
    new Cell(new TableData("A Value"))
    ))
    }}> Add row </button>

<SvelteTable data={table} size=5em />