import type { Listener } from "../Listener";
import { Observable } from "../Listener";

/**
 * A class managing and broadcasting errors.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class ErrorQueue {
    private queue: Observable<Array<Error | string>> = new Observable([]);

    /**
     * Add an error to be broadcasted.
     * @param error {@code Error | string}
     */
    public addError(error: Error | string) {
        this.queue.update(errors => {
            errors.push(error);
            return errors;
        });
    }

    /**
     * Remove the first occurrence of the given error and broadcast the new error queue.
     * @param error {@code Error | string}
     */
    public removeError(error: Error | string) {
        this.queue.update(errors => {
            let index = errors.indexOf(error);
            if (index >= 0) {
                errors.splice(index, 1);
            }
            return errors;
        })
    }

    /**
     * Add an error listener to be notified on broadcasts
     * @param listener {@code ErrorListener}
     */
    public addListener(listener: Listener<(Error | string)[]>) {
        this.queue.add(listener);
    }
}