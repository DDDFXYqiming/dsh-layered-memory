# 开发与测试

## 环境

单元测试会 import 宿主的几个包（`@deepseek-ai/dsh-tools`、`@deepseek-ai/schemastery` 等），它们已经写在 `devDependencies` 里。

pnpm 11 有两个行为需要留意，仓库里已经配好。

- 它不再读 `.npmrc` 的 `auto-install-peers`，改用 `pnpm-workspace.yaml` 的 `autoInstallPeers: false`。不关掉的话，lockfile 会锁入 peer 范围无法满足的预发布版本，`--frozen-lockfile` 直接失败
- 它默认拦截 24 小时内发布的包，`minimumReleaseAgeExclude` 里对 @deepseek-ai 的 alpha 版本逐条豁免

`verifyDepsBeforeRun: false` 关掉 run 之前的依赖预检。不关的话，预检会去 registry 找宿主私有包（`@deepseek-ai/dsh-type-meta` 这类并不发布的包），`pnpm test` 还没跑就报 404。

## 命令

```bash
pnpm install
pnpm build        # 对全部 src/*.js 与 lib/index.js 做 node --check，语法门禁
pnpm test         # 全量回归（语法门禁 + vitest + node --test）
pnpm test:smoke   # dsh --profile headless --dump-config
```

`lib/index.js` 是薄壳，只有 `export * from "../src/index.js"`。源码即交付物，不需要打包步骤。

## 测试

回归用例按版本分文件，`test/v0xx.test.mjs` 对应同名版本引入的行为。修一个缺陷时补一个同版本号的用例。

## 发布

1. 改 `package.json` 的版本号
2. 在 `CHANGELOG.md` 顶部加条目，写清改了什么、为什么
3. `pnpm test` 全绿
4. 提交并推送
