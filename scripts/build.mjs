import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, lstatSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import * as esbuild from "esbuild";
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

// Optional files: the graph view is owned by another task and may land later.
const optional = path => (existsSync(join(root, path)) ? read(path) : null);
const graphViewClient = optional("client/graph-view.js");
const graphViewCss = optional("client/graph-view.css");
const graphD3 = optional("client/vendor/graph/d3.min.js");

/* -------------------------------------------------------------------------- */
/*  Third-party runtime bundle                                                 */
/* -------------------------------------------------------------------------- */
/* framer-motion + lucide-react + the vendored EasyUI components are bundled
 * into one IIFE. `react`, `react-dom` and every `@deepseek-ai/*` module stay
 * external so they resolve through the host-injected `require` — the artifact
 * therefore contains exactly one React and no copy of a host package. The
 * bundle is emitted as a local `var` inside the module factory, so nothing is
 * published on `globalThis`. */
const runtimeBundle = await esbuild.build({
	entryPoints: [join(root, "client/ui-runtime-entry.js")],
	bundle: true,
	format: "iife",
	globalName: "__LM_UI__",
	platform: "browser",
	target: ["es2022"],
	// The automatic runtime keeps JSX modules free of a `React` binding in
	// scope; `react/jsx-runtime` stays external and is resolved by the host.
	jsx: "automatic",
	loader: { ".css": "text" },
	external: ["react", "react-dom", "react/jsx-runtime", "@deepseek-ai/*"],
	minify: true,
	legalComments: "inline",
	write: false,
	logLevel: "silent",
});
const runtimeCode = runtimeBundle.outputFiles[0].text;

/* -------------------------------------------------------------------------- */
/*  d3 (ISC) — loaded into a local CommonJS scope, never on `globalThis`        */
/* -------------------------------------------------------------------------- */
const d3Scope = graphD3
	? [
		"const __DSH_LMD_D3__ = (function () {",
		"	var exports = {};",
		"	var module = { exports: exports };",
		graphD3,
		"	return module.exports;",
		"})();",
	].join("\n")
	: null;

/* -------------------------------------------------------------------------- */
/*  Licences shipped with the status sub-package                               */
/* -------------------------------------------------------------------------- */
const licenseSources = [
	["licenses/easyui.txt", "client/vendor/easyui/LICENSE", "EasyUI components (MIT), Copyright (c) 2026 Suraj Maurya"],
	["licenses/d3.txt", "client/vendor/graph/d3.LICENSE.txt", "d3 (ISC), Copyright 2010-2026 Mike Bostock"],
	["licenses/framer-motion.txt", "node_modules/framer-motion/LICENSE.md", "framer-motion (MIT), Copyright (c) 2021 Framer B.V."],
	["licenses/lucide-react.txt", "node_modules/lucide-react/LICENSE", "lucide-react (ISC), Copyright (c) 2022 Lucide Contributors"],
];
const licenseArtifacts = new Map();
for (const [target, source, label] of licenseSources) {
	const path = join(root, source);
	if (!existsSync(path)) throw new Error(`缺少第三方许可文件: ${source}`);
	licenseArtifacts.set(target, readFileSync(path, "utf8"));
}
const notice = [
	"本子包内含以下第三方组件的打包运行时，许可证全文随包发布：",
	"",
	"- EasyUI 组件（改编自 https://github.com/Surajmaurya1/easyui ，MIT）→ licenses/easyui.txt",
	"- framer-motion 13.5.1（MIT）→ licenses/framer-motion.txt",
	"- lucide-react 1.31.0（ISC）→ licenses/lucide-react.txt",
	"- d3 7.9.2（ISC）→ licenses/d3.txt",
	"",
	"组件来源、改编范围与上游地址见 docs/component-sources.md 与 docs/graph-components.md。",
].join("\n");

/* -------------------------------------------------------------------------- */
/*  Client bundle assembly                                                     */
/* -------------------------------------------------------------------------- */
const factoryParts = [];
if (d3Scope) factoryParts.push(d3Scope);
factoryParts.push(runtimeCode);
factoryParts.push(stripExports(contract));
factoryParts.push(stripExports(client));
if (graphViewClient) {
	factoryParts.push(`const GRAPH_VIEW_CSS = ${JSON.stringify(graphViewCss || "")};`);
	factoryParts.push(stripExports(graphViewClient));
}
factoryParts.push(stripExports(browserClient));
const wiringCode = [
	// `createMemoryUiRuntime` is an ESM export of the bundled entry, so inside
	// the IIFE it only exists as a property of the bundle's global name.
	"const runtime = __LM_UI__.createMemoryUiRuntime(require, { d3: typeof __DSH_LMD_D3__ === \"undefined\" ? undefined : __DSH_LMD_D3__ });",
	"runtime.styles = typeof GRAPH_VIEW_CSS === \"undefined\" ? \"\" : GRAPH_VIEW_CSS;",
	"runtime.graphViewStyles = runtime.styles;",
	"if (typeof createMemoryGraphView === \"function\") runtime.graphView = createMemoryGraphView(require, runtime);",
	`const statusClient = createStatusClient(require, ${JSON.stringify(css)});`,
	`const memoryBrowserClient = createMemoryBrowserClient(require, ${JSON.stringify(browserCss)}, runtime);`,
	"return {",
	"	inject: statusClient.inject,",
	"	async apply(ctx) {",
	"		const disposeStatus = await statusClient.apply(ctx);",
	"		let disposeBrowser;",
	"		try { disposeBrowser = await memoryBrowserClient.apply(ctx); }",
	"		catch (error) { await disposeStatus(); throw error; }",
	"		return async () => { await disposeBrowser(); await disposeStatus(); };",
	"	},",
	"};",
].join("\n");
factoryParts.push(wiringCode);

const clientBundle = [
	"// 由 scripts/build.mjs 生成。",
	"window.__ModuleLoader__.load({id: " + JSON.stringify(STATUS_PACKAGE) + ",factory(require){",
	factoryParts.join("\n"),
	"}});",
	"",
].join("\n");

/* -------------------------------------------------------------------------- */
/*  Wiring guard                                                                */
/* -------------------------------------------------------------------------- */
/* A factory that only exists as a property of the bundled entry would be an
 * undefined bare identifier at load time — a ReferenceError that a syntax
 * check cannot see. Assert that every factory the wiring calls is defined in
 * the assembled factory scope. */
const factoryBody = factoryParts.join("\n");
const requiredFactories = ["createStatusClient", "createMemoryBrowserClient"];
if (graphViewClient) requiredFactories.push("createMemoryGraphView");
for (const name of requiredFactories) {
	const defined = new RegExp(`(?:function\\s+${name}\\b|(?:const|let|var)\\s+${name}\\b)`).test(factoryBody);
	if (!defined) throw new Error(`构建失败：factory 作用域内没有定义 ${name}`);
}
if (/(?<![.\w])createMemoryUiRuntime\s*\(/.test(wiringCode)) {
	throw new Error("构建失败：createMemoryUiRuntime 只能通过 __LM_UI__.createMemoryUiRuntime 调用");
}
if (!/var\s+__LM_UI__\s*=/.test(factoryBody)) {
	throw new Error("构建失败：客户端运行时包没有声明 __LM_UI__");
}

const statusManifest = {
	name: STATUS_PACKAGE, version: manifest.version, type: "module", main: "index.js",
	description: "会话输入区的记忆维护活动、固定会话与只读历史。", license: manifest.license,
	exports: { ".": "./index.js", "./client": "./client.js", "./package.json": "./package.json", "./locale/*.json": "./locale/*.json" },
	files: ["index.js", "status-contract.js", "client.js", "locale", "licenses", "NOTICE", "LICENSE"],
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
	["client.js", clientBundle],
	["NOTICE", notice + "\n"],
	["LICENSE", read("LICENSE")],
]);
for (const [name, content] of licenseArtifacts) artifacts.set(name, content);
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
if (graphViewClient) files.push("client/graph-view.js");
for (const file of files) execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "inherit" });
console.log(`记忆状态 bare 子包已构建并准备为 bundled dependency，JavaScript 语法检查通过（客户端 bundle ${(clientBundle.length / 1024).toFixed(1)} kB）。`);
