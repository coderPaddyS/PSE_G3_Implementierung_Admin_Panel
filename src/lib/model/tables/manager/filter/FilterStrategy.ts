import type { ToDisplayData } from "../ToDisplayData";

export abstract class FilterStrategy<T> implements ToDisplayData {
    
    private name: string;
    protected supplier: () => string;

    public constructor(name: string) {
        this.name = name;
    }

    public setFilter(supplier: () => string) {
        this.supplier = supplier;
    }

    public abstract filter(data: T[]): boolean;

    public toDisplayData(): [string] {
        return [this.name];
    }
    
}