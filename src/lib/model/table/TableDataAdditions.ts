/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

/**
 * An enum representing the possible data values of a {@link TableData}
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export enum TableDataAdditions {

    /**Display the content as HTML-Code */
    HTML,

    /**Display the content as a value and cast to string */
    VALUE,

    /**Display the content as a component which should be rendered */
    COMPONENT,

    /**Display the content as a table */
    TABLE
}