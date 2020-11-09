// @ts-nocheck
const fs = require("fs");
const minifier = require("html-minifier").minify;

// 读取JS代码
const jsCode        = fs.readFileSync("./src/quine.js", "utf8");
// 读取CSS代码
const cssCode       = fs.readFileSync("./src/quine.css", "utf8");
// 读取HTML模板
const htmlTemplate  = fs.readFileSync("./static/template.html", "utf8");

// HTML中的各Placeholder
const placeholders = {
    code: "Code",
    stylesheet: "Stylesheet",
    image: "Image",
};
const buildPlaceholderRegex = (placeholder) => (
    new RegExp(`{{\\s?${placeholder}\\s?}}`, "i")
);

for (const key in placeholders) {
    placeholders[key] = buildPlaceholderRegex(placeholders[key]);
}

// 将JS代码填充到HTML模板中，并进行压缩
const newHtmlCode = minifier(
    htmlTemplate
        .replace(placeholders.code, jsCode)
        .replace(placeholders.stylesheet, cssCode)
, {
    removeAttributeQuotes: true,
    minifyCSS: true,
    minifyJS: true,
});

// 将HTML写入到dist目录
fs.writeFileSync("./dist/index.html", newHtmlCode);
