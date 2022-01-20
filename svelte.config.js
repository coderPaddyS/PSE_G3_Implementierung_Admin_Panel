import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { ViteRsw } from 'vite-plugin-rsw'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
            fallback: "index.html"
        }),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: { 
            options: {
                ssr: false,
            },
            plugins: [ 
                // ViteRsw adds support for web-assembly written in rust.
                // It adds compiling and importing of the modules.
                ViteRsw({ 
                    root: "src/lib/",
                    // crates: [{ name: "kifapwa" }],
                    crates: ["kifapwa"],
                    unwatch: ["*/pkg/*"],
                    profile: process.env.NODE_ENV === 'production' ? "release" : "dev",
                    target: "web",
                }) 
            ]
        }
	}
};

export default config;
