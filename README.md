# Kit-Finder-Admin-Panel

Dieses Repo ist die Implementierung des Admin-Panels nach Spezifikation des Entwurfes des PSE-Projektes "Kit-Finder".

# Kompilierungsmindestanforderungen
Zum Kompilieren wird `node` gemeinsam mit `npm` oder ähnlichem (z.B. `yarn`) benötigt.
Des Weiteren befindet sich in `./src/lib/kit-finder-admin-panel-wasm` eine Rust-Crate.
Hierfür werden [`rustup`](https://rustup.rs/) und [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/) benötigt.

# Kompilierung
Änderungen an der Rust-Crate können durch den Befehl `yarn wasm` zu Web-Assembly compiliert werden.
Durch `npm run dev` bzw. `yarn dev` wird das Projekt gebaut, `npm run build` bzw. `yarn build` bauen die Produktionsvariante.