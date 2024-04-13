## Localizing the ESM distribution of monaco-editor

<img width="839" alt="image" src="https://github.com/alexdima/monaco-editor-localization/assets/5047891/573527ad-3668-49d4-978f-d5f29fd0d4ee">

### Running

```
npm install
node prepare.js
node build.js
npx serve -l tcp://127.0.0.1:3000
open http://127.0.0.1:3000/dist/
```

### Explanation

* This repository is based [on the esbuild sample](https://github.com/microsoft/monaco-editor/tree/main/samples/browser-esm-esbuild), but the `prepare.js` script should work for any other bundler.
* The solution consists of scanning the `/amd/` distribution of the monaco editor and creating a mapping from all English strings to translated strings.
* Then, the `monaco-editor/esm/vs/nls.js` file is patched to contain all of these strings.
* As a consumer of the editor, you need to define `self.MONACO_LANGUAGE` before loading the source code for the editor
  * Supported values: `"de", "en", "es", "fr", "it", "ja", "ko", "ru", "zh-cn", "zh-tw"
