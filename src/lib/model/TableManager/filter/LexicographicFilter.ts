import { FilterStrategy } from "./FilterStrategy";

export class LexicographicFilter<T> extends FilterStrategy<T> {

    public filter(data: T[]): boolean {
        if (!this.supplier || !this.supplier()) {
            return undefined;
        }

        let term = this.supplier();
        console.log(term);
        if (term.length == 0) {
            console.log("undefined", undefined)
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