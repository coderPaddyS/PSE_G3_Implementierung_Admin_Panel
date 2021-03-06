/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { DataObject } from "$lib/model/recursive_table/Types";

/**
 * A type implementing this interface declares the data, it wants to be displayed in a table by a {@link TableManager}
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export interface ToDisplayData {

    /**
     * The data which should be displayed by the {@link TableManager}
     */
    toDisplayData: () => (string | DataObject<string>)[];
}