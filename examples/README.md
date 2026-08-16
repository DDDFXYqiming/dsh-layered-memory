# 示例记忆（examples/）

本目录是从实际运行环境导出的**首批经验记忆**（`$DSH_HOME/memory/` 的快照），作为开箱即用的种子内容与格式参考。

## 用法

新环境初始化记忆库后（插件首次加载自动创建 L0/L1/L2 模板），可按需复制：

```powershell
# 复制全部示例 SOP 到记忆库
Copy-Item examples\*.md "$env:USERPROFILE\.dsh\memory\sops\"
# 之后运行 memory_index 工具同步 L1 索引
```

## 内容说明

| 文件 | 类型 | 内容 |
|---|---|---|
| `dsh-plugin-dev-sop.md` | L3 SOP | DSH 官方插件开发规范要点（bundle/Config/裸条目覆盖） |
| `dsh-plugin-test-sop.md` | L3 SOP | 插件自测流程（语法检查 → mock → headless CLI 自测） |
| `dsh-vision-pitfalls.md` | L3 SOP | dsh-vision-skill 开发踩坑实录 |
| `dsh-env-sop.md` | L3 SOP | 本机 DSH 环境差异（补丁/凭证/重启/目录） |

> 示例中的环境事实（路径/凭证引用）来自开发机，复制到新环境前请核对。

## 模板（templates/）

`memory_management_sop.md`（L0 公理）/ `index.txt`（L1 索引模板）/ `facts.md`（L2 模板）——与插件初始化时生成的内容一致，供查阅与修改基线。
