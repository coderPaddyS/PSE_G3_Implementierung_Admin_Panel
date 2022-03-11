import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import type { Alias } from "$lib/model/tables/official/OfficialAliases";
import type { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";

import { jest } from "@jest/globals"

export class ServerMock {

    private blacklist: BlacklistEntry[];
    private official: Alias[];
    private suggestions: AliasSuggestionsEntry[];

    public constructor(
        blacklist: BlacklistEntry[],
        official: Alias[],
        suggestions: AliasSuggestionsEntry[]
    ) {
        this.blacklist = blacklist;
        this.official = official;
        this.suggestions = suggestions;
    }

    public getBlacklist(): BlacklistEntry[] {
        return this.blacklist;
    }

    public getOfficial(): Alias[] {
        return this.official;
    }

    public getSuggestions(): AliasSuggestionsEntry[] {
        return this.suggestions;
    }

    public setBlacklist(data: BlacklistEntry[]) {
        this.blacklist = data;
    }

    public setOfficial(data: Alias[]) {
        this.official = data;
    }

    public setSuggestions(data: AliasSuggestionsEntry[]) {
        this.suggestions = data;
    }

    public getFetchBackendMock(): (body: string) => any {
        return jest.fn<Promise<any>, [string]>().mockImplementation(body => {
            let variables = JSON.parse(body).variables;
            if (body.includes("getAmountEntriesBlacklist")) {
                return Promise.resolve({data: {getAmountEntriesBlacklist: this.blacklist.length}})
            }
            if (body.includes("getAmountEntriesAliasSuggestion")) {
                return Promise.resolve({data: {getAmountEntriesAliasSuggestion: this.suggestions.length}})
            }
            if (body.includes("getAmountEntriesAlias")) {
                return Promise.resolve({data: {getAmountEntriesAlias: this.official.length}})
            }
            if (body.includes("getAliasSuggestions")) {
                let { minValToShowPos, minValToShowNeg } = variables;
                return Promise.resolve({
                    data: {
                        getAliasSuggestions: this.suggestions
                            .filter(e => e.getUpvotes() >= minValToShowPos && e.getDownvotes() >= minValToShowNeg)
                            .map(e => {
                                return {
                                    suggester: e.getSuggester(),
                                    name: e.getName(),
                                    posVotes: e.getUpvotes(),
                                    negVotes: e.getDownvotes(),
                                    mapID: e.getId(),
                                    mapObject: e.getBuilding() + "," + e.getRoom()
                                }
                            })
                    }
                });
            }
            if (body.includes("getAllAliases")) {
                return Promise.resolve({data: {getAllAliases: this.official.map(e => {
                    return {
                        name: e.getName(),
                        mapID: e.getId(),
                        mapObject: e.getBuilding() + "," + e.getRoom()
                    }
                })}})
            }
            if (body.includes("getBlacklist")) {
                return Promise.resolve({data: {getBlacklist: this.blacklist.map(e => e.toDisplayData()[0])}})
            }
            if (body.includes("removeAlias")) {
                let alias = this.official.filter(v => v.getName() == variables.alias && v.getId() == variables.mapID)[0];
                return Promise.resolve({data: {removeAlias: this.official.splice(this.official.indexOf(alias),1) != undefined}})
            }
            if (body.includes("removeFromBlacklist")) {
                let entry = this.blacklist.filter(e => e.toDisplayData()[0] == variables.blacklistedToRem)[0]
                return Promise.resolve({data: {removeFromBlacklist: this.blacklist.splice(this.blacklist.indexOf(entry),1) != undefined}})
            }
            if (body.includes("disapproveAliasSuggestion")) {
                let alias = this.suggestions.filter(a => a.getName() == variables.aliasSuggestion && a.getId() == variables.mapID)[0];
                let result = this.suggestions.splice(this.suggestions.indexOf(alias), 1);
                return Promise.resolve({data: {disapproveAliasSuggestion: result != undefined}})
            }
            if (body.includes("blacklistAlias")) {
                if (this.blacklist.filter(e => e.toDisplayData()[0] == variables.toBlacklist).length == 0) {
                    this.blacklist.push(new BlacklistEntry(variables.toBlacklist));
                    this.suggestions = this.suggestions.filter(e => e.getName() != variables.toBlacklist);
                    this.official = this.official.filter(e => e.getName() != variables.toBlacklist);
                    return Promise.resolve({data: {blacklistAlias: true}});
                }
                return Promise.resolve({data: {blacklistAlias: false}});
            }
            if (body.includes("approveAliasSuggestion")) {
                if (this.blacklist.filter(e => e.toDisplayData()[0] == variables.aliasSuggestion).length != 0 ||
                    this.official.filter(e => e.getName() == variables.aliasSuggestion && e.getId() == variables.mapID).length != 0) {
                    return Promise.resolve({data: {approveAliasSuggestion: false}});
                }

                let suggestion = this.suggestions.filter(e => e.getId() == variables.mapID && e.getName() == variables.aliasSuggestion)[0];
                this.official.push(suggestion.toAlias());
                this.suggestions.splice(this.suggestions.indexOf(suggestion), 1);
                return Promise.resolve({data: {approveAliasSuggestion: true}});
            }     
        })
    }
}