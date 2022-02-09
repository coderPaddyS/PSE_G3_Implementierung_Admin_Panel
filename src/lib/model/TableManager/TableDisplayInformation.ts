import type { Table } from "../table/TableComponents";

export interface TableDisplayInformation<T, TA extends Table<T>> {
    supplier: () => Promise<TA>;
    updater: (listener: (table: TA) => void) => void;
    filterableData: () => T[];
}