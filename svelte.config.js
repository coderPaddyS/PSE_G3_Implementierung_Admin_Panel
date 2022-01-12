import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { ViteRsw } from 'vite-plugin-rsw'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: { 
            plugins: [ 
                // ViteRsw adds support for web-assembly written in rust.
                // It adds compiling and importing of the modules.
                ViteRsw({ 
                    root: "src/lib/",
                    // crates: [{ name: "kit-finder" }],
                    crates: ["kit-finder"],
                    unwatch: ["*/pkg/*"],
                    profile: process.env.NODE_ENV === 'production' ? "release" : "dev",
                    target: "web",
                }) 
            ],
            optimizeDeps: {
                exclude: ["kit-finder"],
              },
        }
	}
};

export default config;
