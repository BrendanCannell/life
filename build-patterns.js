var patternFileNames = new Set(require("./pattern-filenames.json"))
var allPatterns = require("./all-patterns.json")
var patterns =
allPatterns
.filter(([name, filename]) =>
  patternFileNames.has(filename)
  && !name.includes(".rle")
  && !name.includes("_synth")
)
.map(([name, filename]) =>
  [name.toUpperCase(), filename]
)
require('fs').writeFileSync("./src/patterns.json", JSON.stringify(patterns))