/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { FilterStrategy } from "./FilterStrategy";

/**
 * A filter to treat the given data as a Number and filter them given a maximum.
 * 
 * @template T The data to be filtered
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class MaximumNumericFilter<T> extends FilterStrategy<T> {

    public filter(data: T[]): boolean {
        if (!this.supplier || !this.supplier() || !data) {
            return undefined;
        }

        let term = this.supplier();
        if (!term) {
            return undefined;
        } 
        return data.filter(t => Number(term) >= Number(t)).length > 0;
    }
}