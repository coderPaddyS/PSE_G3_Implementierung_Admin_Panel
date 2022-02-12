import type { Table } from "$lib/model/recursive_table/TableComponents";
import type { FilterStrategy } from "./filter/FilterStrategy";

export interface TableDisplayInformation<T, TA extends Table<T>> {
    supplier: () => Promise<TA>;
    updater: (listener: (table: TA) => void) => void;
    filterableData: () => [number, FilterStrategy<string>][];
    size: () => Promise<number>;
    tableTitle: () => string;
}