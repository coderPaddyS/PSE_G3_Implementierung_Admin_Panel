import { FilterStrategy } from "./FilterStrategy";

export class MaximumNumericFilter<T> extends FilterStrategy<T> {

    public filter(data: T[]): boolean {
        if (!this.supplier || !this.supplier()) {
            return undefined;
        }

        let term = this.supplier();
        if (!term) {
            return undefined;
        } 
        return data.filter(t => Number(term) >= Number(t)).length > 0;
    }
}