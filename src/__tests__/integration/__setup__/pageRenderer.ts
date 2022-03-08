import { cleanup, render as r } from "@testing-library/svelte";

import Svelte__Blacklist from "$lib/../routes/admin/panel/blacklist/index.svelte";
import Svelte__Official from "$lib/../routes/admin/panel/alias/index.svelte";
import Svelte__Suggestions from "$lib/../routes/admin/panel/suggestions/index.svelte";
import Svelte__Changes from "$lib/../routes/admin/panel/changes/index.svelte";
import Svelte__Settings from "$lib/../routes/admin/panel/settings/index.svelte";
import Svelte__Dashboard from "$lib/../routes/admin/panel/index.svelte";

async function renderBlacklist(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Blacklist).container;
    // Cannot intercept on component awaiting its promise, which is resolved immediately
    // Therefore let the browser finish the rendering of the component by awaiting a pseudo-timeout
    await new Promise((r) => setTimeout(r, 0));
    return page;
}

async function renderOfficial(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Official).container;
    // Cannot intercept on component awaiting its promise, which is resolved immediately
    // Therefore let the browser finish the rendering of the component by awaiting a pseudo-timeout
    await new Promise((r) => setTimeout(r, 0));
    return page;
}

async function renderSuggestions(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Suggestions).container;
    // Cannot intercept on component awaiting its promise, which is resolved immediately
    // Therefore let the browser finish the rendering of the component by awaiting a pseudo-timeout
    await new Promise((r) => setTimeout(r, 0));
    return page;
}

async function renderChanges(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Changes).container;
    // Cannot intercept on component awaiting its promise, which is resolved immediately
    // Therefore let the browser finish the rendering of the component by awaiting a pseudo-timeout
    await new Promise((r) => setTimeout(r, 0));
    return page;
}

async function renderDashboard(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Dashboard).container;
    
    // await the Animation to be finished and give a little overhead
    await new Promise((r) => setTimeout(r, 1100));
    return page;
}

async function renderSettings(): Promise<HTMLElement> {
    cleanup();
    let page = r(Svelte__Settings).container;
    // Cannot intercept on component awaiting its promise, which is resolved immediately
    // Therefore let the browser finish the rendering of the component by awaiting a pseudo-timeout
    await new Promise((r) => setTimeout(r, 0));
    return page;
}

const render = {
    blacklist: renderBlacklist,
    official: renderOfficial,
    suggestion: renderSuggestions,
    changes: renderChanges,
    dashboard: renderDashboard,
    settings: renderSettings
}

export default render;