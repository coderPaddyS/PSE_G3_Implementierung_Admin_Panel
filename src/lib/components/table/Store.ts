/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

/**
 * A Predicate is a function which given a element returns true or false
 */
export type Predicate<T> = (t: T) => boolean;

/**
 * A Sorter is a function which given two elements returns their order
 */
export type Sorter<T> = (a: T, b: T) => [T, T];

/**
 * This function inverts the given {@Sorter}
 * @param sorter Sorter<R>
 * @returns Sorter<R> but inverted
 */
export function invertSort<R>(sorter: Sorter<R>): Sorter<R> {
    return (a: R, b: R) => {
        let [first, second] = sorter(a,b);
        return [second, first]
    }
}

// The individual key to access the crawler context of the table
export const crawlerKey = Symbol();