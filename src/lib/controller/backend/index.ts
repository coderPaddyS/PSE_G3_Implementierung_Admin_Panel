import type { Table } from "$lib/model/table/TableComponents";
import { Blacklist } from "$lib/model/Blacklist";
import type { BlacklistListener } from "$lib/model/Blacklist";

/**
 * This class manages the communication with the remote backend on the server.
 * 
 * @author Patrick Schneider
 * @version 0.1
 */
export class Backend {

    private blacklist: Blacklist;

    /**
     * Construct a new instance of the Backend
     */
    public constructor() {
        this.blacklist = new Blacklist();
        this.blacklist.setData(["Eintrag 1", "Eintrag 42", "Eintrag 3"]);
    }

    /**
     * Fetches the blacklist data and returns a parsed table.
     * @returns Promise of {@link Table<string>}
     */
    public async getBlacklist(): Promise<Table<string>> {
        return this.blacklist.getTable();
    }

    /**
     * Removes the given entry from the blacklist.
     * @param entry {@link string}
     */
    public async removeFromBlacklist(entry: string) {
        this.blacklist.removeEntry(entry);
    }

    /**
     * Observe changes on the backend
     * @param update {@link BlacklistListener}
     */
    public onBlacklistUpdate(update: BlacklistListener) {
        this.blacklist.addListener(update);
    }
}