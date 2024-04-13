//@ts-check

//
// (1) This script reads all translated strings from the AMD variant of the monaco-editor and creates a file
// at `monaco-editor/esm/vs/nls-data.json` that maps each English string to translations in other languages.
// Sometimes, the same English string is translated differently (37 hits), but after sampling a few of them,
// they all seem to mean the same thing. So I don't think this is a real problem.
//
// (2) It also patches the nls.js file that ships by default at `monaco-editor/esm/vs/nls.js` to use the data.
//

const fs = require("fs");
const path = require("path");
const monacoEditorPath = path.join(__dirname, "node_modules/monaco-editor");

function discoverNLSFiles(dir, result) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      discoverNLSFiles(filePath, result);
    } else {
      if (/\.nls\./.test(file)) {
        result.push(filePath);
      }
    }
  }
}

/** @type {{[language:string]: {[moduleId:string]:string[]}}} */
const nlsValues = {};

(function () {
  const nlsFiles = [];
  discoverNLSFiles(path.join(monacoEditorPath, "dev"), nlsFiles);
  for (const nlsFile of nlsFiles) {
    const content = fs.readFileSync(nlsFile, "utf8");
    const basename = path.basename(nlsFile).split(".");
    const language =
      basename[basename.length - 2] === "nls"
        ? "en"
        : basename[basename.length - 2];
    new Function("define", content)(function (entrypoint, value) {
      nlsValues[language] = nlsValues[language] || {};
      for (const moduleId in value) {
        nlsValues[language][moduleId] = value[moduleId];
      }
    });
  }
})();

/** @type {{[enString:string]: {[lang:string]:string}}} */
const langMap = {};
for (const lang in nlsValues) {
  if (lang === "en") {
    continue;
  }
  const langValues = nlsValues[lang];
  for (const moduleId in langValues) {
    const values = langValues[moduleId];
    for (let i = 0; i < values.length; i++) {
      const translatedString = values[i];
      const enString = nlsValues["en"][moduleId][i];
      langMap[enString] = langMap[enString] || {};

      if (langMap[enString][lang] !== undefined) {
        if (langMap[enString][lang] !== translatedString) {
          console.log(
            ` INFO: same string translated differently: ${enString} -->  ${langMap[enString][lang]} !== ${translatedString}`
          );
        }
      }
      langMap[enString][lang] = translatedString;
    }
  }
}

const patchedNLSModule = fs.readFileSync(path.join(__dirname, 'nls.js'), 'utf8');
const patchedNLSModuleWithStrings = `
  ${patchedNLSModule}
function getNlsData() {
  return ${JSON.stringify(langMap, null, 2)};
}
`
fs.writeFileSync(
  path.join(monacoEditorPath, "esm/vs/nls.js"),
  patchedNLSModuleWithStrings
);

console.log();
console.log(`Patched ${path.join(monacoEditorPath, "esm/vs/nls.js")}`);
console.log(`Now you can define self.MONACO_LANGUAGE = 'de' for example`)
