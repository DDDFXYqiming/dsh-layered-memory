// 公共入口：插件名、依赖声明、Config schema、apply。schema 定义在 apply.js（tools/events 需要同一份默认常量，避免 import 环）。
import { apply, Config, inject } from "./apply.js";

const name = "layered-memory";

export { apply, Config, inject, name };
