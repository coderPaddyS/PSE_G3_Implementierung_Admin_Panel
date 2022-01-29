import type { BlacklistListener } from "$lib/model/Blacklist";
import type { Table } from "$lib/model/table/TableComponents"
import { Backend } from "../backend";


export class Framework {

    private static instance: Framework = undefined;
    private backend: Backend;

    private constructor() {
        this.backend = new Backend();
    }

    public static getInstance(): Framework {
        if (Framework.instance === undefined) {
            Framework.instance = new Framework();
        }
        return Framework.instance;
    }

    public getBlacklist(): Table<string> {
        return this.backend.getBlacklist();
    }

    public removeFromBlacklist(entry: string) {
        this.backend.removeFromBlacklist(entry);
    }

    public onBlacklistUpdate(onUpdate: BlacklistListener) {
        this.backend.onBlacklistUpdate(onUpdate);
    }
}