
export class ErrorQueue {
    private queue: Array<Error | string> = [];
    private listeners: Set<(errors: Array<Error | string>) => void> = new Set();

    public addError(error: Error | string) {
        this.queue.push(error);
        this.notify()
    }

    public removeError(error: Error | string) {
        let index = this.queue.indexOf(error);
        if (index >= 0) {
            this.queue.splice(index, 1);
            this.notify()
        }
    }

    public addListener(listener: (errors: Array<Error | string>) => void) {
        this.listeners.add(listener);
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.queue))
    }
}