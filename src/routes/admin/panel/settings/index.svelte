<script lang=ts>
    import { Settings, SettingsDisplayNames } from "$lib/model/settings/Settings";
    import Setting from "$lib/view/components/settings/Setting.svelte";
    import { fly } from "svelte/transition";

    let settings = Settings.getInstance();

    let data = settings.getData();
</script>

<style lang=scss>
    .settings {
        display: flex;
        flex-direction: column;
        width: 70%;
        justify-content: center;
        align-items: center;
        margin: 1em auto 1em auto;
    }
</style>

<svelte:head>
    <title>Einstellungen - Admin-Panel - KIT-Finder</title>
</svelte:head>

<div class=settings in:fly={{y: 500}}>
    {#each Object.entries(data) as [key, setting]}
        <Setting start={setting} text={SettingsDisplayNames[key]} update={(value) => settings.update((data) => {
            data[key] = value;
            return data;
        })}/>
    {/each}
</div>