/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { ToDisplayData } from "../ToDisplayData";

/**
 * A strategy to implement different filter behavior.
 * 
 * @template T The type to filter
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export abstract class FilterStrategy<T> implements ToDisplayData {
    
    private name: string;
    protected supplier: () => T;

    /**
     * Construct a new filter.
     * @param name The name this filter should be displayed as
     */
    public constructor(name: string) {
        this.name = name;
    }

    /**
     * Set the supplier for the current filter value
     * @param supplier A supplier returning the current filter value {@code () => string}
     */
    public setFilter(supplier: () => T) {
        this.supplier = supplier;
    }

    /**
     * Filter the given data by the current filter value.
     * @param data true, if the filter matches; false if it does not match; 
     *             {@code undefined} if this element should be skipped
     */
    public abstract filter(data: T[]): boolean;

    public toDisplayData(): [string] {
        return [this.name];
    }
    
}