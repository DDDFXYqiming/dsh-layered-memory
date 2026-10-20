// schema 定义在 apply.js：tools/events 需要同一份默认常量，放在这里会形成 import 环。
import { apply, Config, inject } from "./apply.js";

const name = "layered-memory";

export { apply, Config, inject, name };
