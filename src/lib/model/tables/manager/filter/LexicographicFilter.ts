/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { FilterStrategy } from "./FilterStrategy";

/**
 * A lexicographic filter to filter the given data as text.
 * 
 * @template T The type to filter
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class LexicographicFilter<T> extends FilterStrategy<T> {

    public filter(data: T[]): boolean {
        if (!this.supplier || !this.supplier() || !data) {
            return undefined;
        }

        let term = this.supplier();
        if (term.toString().length == 0) {
            return undefined;
        } 
        
        return data.filter(t => {
            if (!t) {
                return false;
            }
            return t.toString().toLowerCase().includes(term.toString().toLowerCase());
        }).length > 0;
    }
}