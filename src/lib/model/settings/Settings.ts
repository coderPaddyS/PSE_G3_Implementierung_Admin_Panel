import { Observable } from "../Listener";
import type { Listener } from "../Listener";

/**
 * This type represents all possible settings, which can be configured.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export type SettingsData = {
    suggestionsMinPositive: number,
    suggestionsMinNegative: number
}

const standardSettings: SettingsData = {
    suggestionsMinNegative: 0,
    suggestionsMinPositive: 0
}

/**
 * This object maps a setting to its corresponding, describing text.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export const SettingsDisplayNames = {
    suggestionsMinPositive: "Min. Anzahl positiver Bewertungen für Alias-Vorschläge",
    suggestionsMinNegative: "Min. Anzahl negativer Bewertungen für Alias-Vorschläge"
}

/**
 * This class manages the access to settings.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Settings {
    private static readonly settingsStoreID = "settings";
    private settingsData: Observable<SettingsData>;
    private static instance: Settings;

    protected constructor() {
        this.settingsData = new Observable(undefined);
        this.settingsData.add(data => this.store(data));

        let json = window.localStorage.getItem(Settings.settingsStoreID);
        if (json) {
            this.settingsData.set(JSON.parse(json));
        } else {
            this.settingsData.set(standardSettings);
        }
    }

    /**
     * Get the instance of this singleton.
     * @returns instance of {@link Settings}
     */
    public static getInstance(): Settings {
        if (!this.instance) {
            this.instance = new Settings();
        }
        return this.instance;
    }

    /**
     * Add an listener to listen on changes of settings.
     * @param listener a {@link Listener} for {@link SettingsData}
     */
    public onUpdate(listener: Listener<SettingsData>) {
        this.settingsData.add(listener);
    }

    /**
     * Getter for the settings data.
     * @returns the current settings
     */
    public getData(): SettingsData {
        return this.settingsData.get();
    }

    /**
     * Update the settings.
     * @param updater A function transforming {@link SettingsData}
     */
    public update(updater: (data: SettingsData) => SettingsData) {
        this.settingsData.update(updater);
    }

    private store(data: SettingsData): SettingsData {
        window.localStorage.setItem(Settings.settingsStoreID, JSON.stringify(data));
        return data;
    }
}