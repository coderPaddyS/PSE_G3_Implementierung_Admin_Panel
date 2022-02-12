/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table } from "$lib/model/recursive_table/TableComponents";
import type { FilterStrategy } from "./filter/FilterStrategy";

/**
 * An interface requiring functions which are used to display a {@link Table}.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export interface TableDisplayInformation<T, TA extends Table<T>> {
    supplier: () => Promise<TA>;
    updater: (listener: (table: TA) => void) => void;
    filterableData: () => [number, FilterStrategy<string>][];
    size: () => Promise<number>;
    tableTitle: () => string;
}