/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

/**
 * A listener gets notified if the value it listens to changes.
 * 
 * @template T The type to listen on
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export type Listener<T> = (value: T) => void;

/**
 * An observable provides functionality to add, remove and notify listeners if the value changes.
 * 
 * @template T The type to observe
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Observable<T> {
    private value: T;
    private listeners: Set<Listener<T>>;
    private interceptor: (value: T) => T;

    /**
     * Initialize the observable with a new value.
     * @param value The initial value
     */
    public constructor(value: T) {
        this.value = value;
        this.listeners = new Set();
    }

    /**
     * Set the value.
     * Updates the listeners.
     * @param value The new value
     */
    public set(value: T) {
        this.value = value;
        this.notify();
    }

    /**
     * Update the value.
     * Updates the listeners.
     * @param updater A function transforming the current value to a new value
     */
    public update(updater: (value: T) => T) {
        this.set(updater(this.value));
    }

    /**
     * Getter for the value
     * @returns value
     */
    public get(): T {
        return this.value;
    }

    /**
     * Add a listener to observe this value.
     * @param listener The listener to add
     */
    public add(listener: Listener<T>) {
        this.listeners.add(listener);
    }

    /**
     * Remove a listener.
     * @param listener The listener to remove
     */
    public remove(listener: Listener<T>) {
        this.listeners.delete(listener);
    }

    private notify() {
        let value = this.interceptor? this.interceptor(this.value) : this.value;
        this.listeners.forEach(listener => listener(value))
    }

    /**
     * Set an interceptor to be called before the listeners are notified. Used to perform an action on the new value.
     * @param interceptor A function to be called just before the listeners are notified.
     */
    public setNotificationInterceptor(interceptor: (value: T) => T){
        this.interceptor = interceptor;
    }
}