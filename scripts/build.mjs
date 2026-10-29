import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, lstatSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { STATUS_PACKAGE } from "../src/status-contract.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const output = join(root, "lib/status");
const bundled = join(root, "node_modules", STATUS_PACKAGE);
const read = path => readFileSync(join(root, path), "utf8");
const stripExports = text => text.replace(/^export /gm, "");
const contract = read("src/status-contract.js");
const client = read("client/status.js");
const browserClient = read("client/browser.js");
const css = read("client/status.css");
const browserCss = read("client/browser.css");
const statusManifest = {
	name: STATUS_PACKAGE, version: manifest.version, type: "module", main: "index.js",
	description: "会话输入区的记忆维护活动、固定会话与只读历史。", license: manifest.license,
	exports: { ".": "./index.js", "./client": "./client.js", "./package.json": "./package.json", "./locale/*.json": "./locale/*.json" },
	files: ["index.js", "status-contract.js", "client.js", "locale", "LICENSE"],
	peerDependencies: {
		"@deepseek-ai/cordis": manifest.peerDependencies["@deepseek-ai/cordis"],
		"@deepseek-ai/dsh-typert-protocol": manifest.peerDependencies["@deepseek-ai/dsh-typert-protocol"],
	},
	dsh: { client: {
		platform: "web", immediately: true,
		inject: ["@deepseek-ai/dsh-api-gateway", "@deepseek-ai/dsh-client-ui-conversation", "@deepseek-ai/dsh-client-locale"],
		external: ["@deepseek-ai/dsh-api-gateway/client"],
	} },
};
const artifacts = new Map([
	["package.json", JSON.stringify(statusManifest, null, 2) + "\n"],
	["index.js", read("src/status.js")],
	["status-contract.js", contract],
	["client.js", "// 由 scripts/build.mjs 生成。\nwindow.__ModuleLoader__.load({id:" + JSON.stringify(STATUS_PACKAGE) + ",factory(require){\n" + stripExports(contract) + "\n" + stripExports(client) + "\n" + stripExports(browserClient) + "\nconst statusClient = createStatusClient(require," + JSON.stringify(css) + ");\nconst memoryBrowserClient = createMemoryBrowserClient(require," + JSON.stringify(browserCss) + ");\nreturn {\n\tinject: statusClient.inject,\n\tasync apply(ctx) {\n\t\tconst disposeStatus = await statusClient.apply(ctx);\n\t\tlet disposeBrowser;\n\t\ttry { disposeBrowser = await memoryBrowserClient.apply(ctx); }\n\t\tcatch (error) { await disposeStatus(); throw error; }\n\t\treturn async () => { await disposeBrowser(); await disposeStatus(); };\n\t},\n};\n}});\n"],
	["LICENSE", read("LICENSE")],
]);
for (const [language, meta] of Object.entries({
	zh: { title: "记忆状态", description: "在输入区显示维护进度、真实变更条数、固定会话与只读历史。" },
	en: { title: "Memory status", description: "Memory maintenance activity, changed entry counts, fixed sessions, and read-only history." },
})) artifacts.set("locale/" + language + ".json", JSON.stringify({ meta }, null, 2) + "\n");

mkdirSync(output, { recursive: true });
if (existsSync(bundled)) {
	if (lstatSync(bundled).isSymbolicLink()) {
		unlinkSync(bundled);
	} else if (JSON.parse(readFileSync(join(bundled, "package.json"), "utf8")).name !== STATUS_PACKAGE) {
		throw new Error("状态依赖目录已有其他包，拒绝覆盖");
	}
}
// 独立文件让 npm pack 避免生成部分 pnpm 安装器会解为空文件的 tar 硬链接。
for (const directory of [output, bundled]) {
	try {
		for (const [name, content] of artifacts) {
			const path = join(directory, name);
			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(path, content);
		}
	} catch (error) {
		if (directory !== bundled || error.code !== "EACCES") throw error;
		console.warn("跳过 bundled 副本写入（目录只读），lib/status 产物不受影响");
	}
}
const files = ["lib/index.js", "lib/status/index.js", "lib/status/status-contract.js", "lib/status/client.js", "client/status.js", "client/browser.js", ...readdirSync(join(root, "src")).filter(name => name.endsWith(".js")).map(name => "src/" + name)];
for (const file of files) execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "inherit" });
console.log("记忆状态 bare 子包已构建并准备为 bundled dependency，JavaScript 语法检查通过。");
