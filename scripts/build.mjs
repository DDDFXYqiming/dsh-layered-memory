import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const read = path => readFileSync(join(root, path), "utf8");
const stripExports = text => text.replace(/^export /gm, "");
const contract = read("src/status-contract.js");
const client = read("client/status.js");
const css = read("client/status.css");
// 客户端 bundle 挂主包：loader 的 client 图按包名归属行，独立子包在 pnpm 的
// tarball 与 link 安装下都拿不到 node_modules 映射（file: 依赖与 bundleDependencies
// 均不物化映射，2026-10-22 实测），新鲜安装必然让状态 entry 报 ERR_MODULE_NOT_FOUND。
const bundle = "// 由 scripts/build.mjs 生成。\n"
	+ "window.__ModuleLoader__.load({id:" + JSON.stringify(manifest.name) + ",factory(require){\n"
	+ stripExports(contract) + "\n" + stripExports(client) + "\n"
	+ "return createStatusClient(require," + JSON.stringify(css) + ");\n}});\n";
mkdirSync(join(root, "lib"), { recursive: true });
writeFileSync(join(root, "lib", "client.js"), bundle);
