
/**
 * An listener to receive updates on the error list
 */
export type ErrorListener = (error: Array<Error | string>) => void;

/**
 * A class managing and broadcasting errors.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class ErrorQueue {
    private queue: Array<Error | string> = [];
    private listeners: Set<ErrorListener> = new Set();

    /**
     * Add an error to be broadcasted.
     * @param error {@code Error | string}
     */
    public addError(error: Error | string) {
        this.queue.push(error);
        this.notify()
    }

    /**
     * Remove the first occurrence of the given error and broadcast the new error queue.
     * @param error {@code Error | string}
     */
    public removeError(error: Error | string) {
        let index = this.queue.indexOf(error);
        if (index >= 0) {
            this.queue.splice(index, 1);
            this.notify()
        }
    }

    /**
     * Add an error listener to be notified on broadcasts
     * @param listener {@code ErrorListener}
     */
    public addListener(listener: ErrorListener) {
        this.listeners.add(listener);
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.queue))
    }
}