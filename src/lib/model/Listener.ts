
export type Listener<T> = (value: T) => void;

export class Observable<T> {
    private value: T;
    private listeners: Set<Listener<T>>;

    public constructor(value: T) {
        this.value = value;
        this.listeners = new Set();
    }

    public set(value: T) {
        this.value = value;
        this.notify();
    }

    public update(updater: (value: T) => T) {
        this.set(updater(this.value));
    }

    public get(): T {
        return this.value;
    }

    public add(listener: Listener<T>) {
        this.listeners.add(listener);
    }

    public remove(listener: Listener<T>) {
        this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.value))
    }
}