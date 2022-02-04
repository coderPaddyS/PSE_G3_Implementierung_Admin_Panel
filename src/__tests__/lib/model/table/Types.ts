import { invertSort, Sorter, tail } from "$lib/model/table/Types";


describe("Testing if tail function", () => {
    test("handles normal input correctly", () => {
        let data = [1, 2, 3, 4];
        expect(tail(data)).toEqual([2,3,4]);
    });
    test("handle empty input correctly", () => {
        let data = [];
        expect(tail(data)).toEqual([]);
    });
    test("handles undefined input correctly", () => {
        let data = undefined;
        expect(tail(data)).toEqual(undefined);
    });
});

describe("Testing if invertSort", () => {
    let id: Sorter<number> = (a, b) => [a, b];

    function sort(sorter: Sorter<number>, data: Array<number>): Array<number> {
        let copy = [...data];
        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                [copy[i], copy[j]] = sorter(copy[i], copy[j]);
            }
        }
        return copy;
    }

    let data = [2,3,4,1,5,2,3,5];
    let invData = [5,3,2,5,1,4,3,2];
    test("id is inverted correctly", ()=> {
        expect(sort(invertSort(id),data)).toEqual(invData);
    });
    test("doubled keeps original state", () => {
        expect(sort(invertSort(invertSort(id)), data)).toEqual(sort(id, data));
    })
})