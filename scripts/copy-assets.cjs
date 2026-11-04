const fs = require("node:fs");
const path = require("node:path");

for (const directory of ["public", "views"]) {
  fs.cpSync(
    path.resolve(__dirname, "..", "src", directory),
    path.resolve(__dirname, "..", "dist", directory),
    { recursive: true },
  );
}
