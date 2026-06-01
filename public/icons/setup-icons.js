const fs   = require("fs");
const path = require("path");

const src  = path.join(__dirname, "node_modules/@tabler/icons-webfont/dist");
const dest = path.join(__dirname, "public/icons");

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

// Copy all files from dist/ to public/icons/
fs.readdirSync(src).forEach(file => {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
  console.log("✅ Copied:", file);
});

console.log("\n🎉 Icons ready at public/icons/");
console.log("   Now restart your server: nodemon app.js");