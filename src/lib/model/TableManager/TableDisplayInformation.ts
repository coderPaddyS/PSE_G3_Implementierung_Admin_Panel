import type { Table } from "../table/TableComponents";
import type { FilterStrategy } from "./filter/FilterStrategy";

export interface TableDisplayInformation<T, TA extends Table<T>> {
    supplier: () => Promise<TA>;
    updater: (listener: (table: TA) => void) => void;
    filterableData: () => [number, FilterStrategy<string>][];
}