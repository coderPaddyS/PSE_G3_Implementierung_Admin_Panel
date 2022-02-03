import type { Table } from "$lib/model/table/TableComponents";
import { Blacklist, BlacklistEntry } from "$lib/model/Blacklist";
import { OfficialAliases } from "$lib/model/OfficialAliases";
import { Alias } from "$lib/model/Alias";
import { AliasSuggestions } from "$lib/model/AliasSuggestions";
import type { TableListener } from "$lib/model/TableManager";

/**
 * This class manages the communication with the remote backend on the server.
 * 
 * @author Patrick Schneider
 * @version 0.1
 */
export class Backend {

    private blacklist: Blacklist;
    private official: OfficialAliases;
    private suggestions: AliasSuggestions;

    /**
     * Construct a new instance of the Backend
     */
    public constructor() {
        this.blacklist = new Blacklist();
        this.blacklist.setData(["Eintrag 1", "Eintrag 42", "Eintrag 3"].map(entry => new BlacklistEntry(entry)));
        this.official = new OfficialAliases();
        this.official.setData([
            new Alias("Alias 1", "Gebäude 1", "Raum 1", 1),
            new Alias("Alias 2", "Gebäude 2", "Raum 2", 2),
            new Alias("Alias 45", "Gebäude 45", "Raum 45", 45),
            new Alias("Alias 8", "Gebäude 8", "Raum 8", 8),
            new Alias("Alias 69", "Gebäude 69", "Raum 69", 69),
        ]);
        this.suggestions = new AliasSuggestions();
        this.suggestions.setData([
            new Alias("Alias 0", "Gebäude 0", "Raum 0", 0),
            new Alias("Alias 3", "Gebäude 3", "Raum 3", 3),
            new Alias("Alias 49", "Gebäude 49", "Raum 49", 49),
            new Alias("Alias 42", "Gebäude 42", "Raum 42", 42),
            new Alias("Alias 420", "Gebäude 420", "Raum 420", 420),
        ])
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
        this.blacklist.removeData(new BlacklistEntry(entry));
    }

    /**
     * Observe changes on the backend
     * @param update {@link BlacklistListener}
     */
    public onBlacklistUpdate(update: TableListener) {
        this.blacklist.addListener(update);
    }

    public async getOfficialAliases(): Promise<Table<string>> {
        return this.official.getTable();
    }

    public async removeFromOfficialAliases(alias: Alias) {
        this.official.removeData(alias);
    }

    public onOfficialAliasesUpdate(update: TableListener) {
        this.official.addListener(update);
    }

    public async getAliasSuggestions(): Promise<Table<string>> {
        return this.suggestions.getTable();
    }

    public async removeFromAliasSuggestions(alias: Alias) {
        this.suggestions.removeData(alias);
    }

    public onAliasSuggestionsUpdate(update: TableListener) {
        this.suggestions.addListener(update);
    }
}