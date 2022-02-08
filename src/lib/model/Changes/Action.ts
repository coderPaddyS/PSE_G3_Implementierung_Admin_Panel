/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

/**
 * An Action represents a event caused by an user which can be executed at another time.
 */
export type Action = () => Promise<boolean>;