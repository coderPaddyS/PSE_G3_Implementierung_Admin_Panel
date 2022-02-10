import { FilterStrategy } from "./FilterStrategy";

export class LexicographicFilter<T> extends FilterStrategy<T> {

    public filter(data: T[]): boolean {
        if (!this.supplier || !this.supplier()) {
            return undefined;
        }

        let term = this.supplier();
        if (term.length == 0) {
            return undefined;
        } 
        
        return data.filter(t => {
            if (!t) {
                return false;
            }
            return t.toString().includes(term);
        }).length > 0;
    }
}