import type { Table } from "$lib/model/table/TableComponents";
import { Blacklist } from "$lib/model/Blacklist";
import type { BlacklistListener } from "$lib/model/Blacklist";

export class Backend {

    private blacklist: Blacklist;

    public constructor() {

    }

    public getBlacklist(): Table<string> {

        if (this.blacklist === undefined) {
            this.blacklist = new Blacklist(["Eintrag 1", "Eintrag 2", "Eintrag 3"])
        }
        return this.blacklist.getTable();

        // return this.blacklist.getTable();
            // return new Table<string>().add(
            //     new TitleRow<string>().add(
            //         new TitleCell<string>(sorter).set(new TableData<string>("Title")),
            //         new TitleCell<string>().set(new TableData<string>("Title"))
            //     ),
            //     new TableRow<string>().add(
            //         new TableCell<string>().add(new TableData("Cell")),
            //         new TableCell<string>().add(new TableDataSvelteComponent((root, props: {index}) => {
            //             return new Remove({
            //                 target: root,
            //                 props: {
            //                     id: "Patrick",
            //                     ...props
            //                 }
            //             })
            //         })
            //     ),
            //     new TableRow<string>().add(
            //         new TableCell<string>().add(new TableData("Cell 2")),
            //         new TableCell<string>().add(
            //         new TableDataSvelteComponent((root, props: {index, crawlOnView}) => {
            //             return new Blacklist({
            //                 target: root,
            //                 props
            //             })
            //         })),
            //     )
            // );
    }

    public removeFromBlacklist(entry: string) {
        this.blacklist.removeEntry(entry);
    }

    public onBlacklistUpdate(update: BlacklistListener) {
        this.blacklist.addListener(update);
    }
}