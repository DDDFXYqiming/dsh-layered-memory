# dsh-vision-pitfalls

dsh-vision-skill 插件开发与运行踩坑实录（2026-08-13 全天实测）。

## 关键前置
- 插件本体零框架补丁；"输入框贴图"依赖宿主源码补丁（vision-patch 4 处：apiproxy 门禁放行 ×2 + llm-deepseek 图片→路径占位 ×2）
- 补丁被 DSH 包升级覆盖后，用 `C:\Users\<user>\.dsh\vision-patch\reapply-vision-patch.ps1` 一键恢复

## 典型坑
1. **还原补丁 = 会话历史图片块直接炸**：UNSUPPORTED_CONTENT 拒绝每轮请求（历史里的 image block 还在）——方案切换前先开新会话
2. **自动重启端口冲突**：EADDRINUSE——重启脚本必须"先杀 → 等 3 秒 → 启动 → 轮询 3080"
3. **宿主清空 DSH_HOME**：插件里读环境路径用 homedir() 兜底
4. **parse_grounding 空数组**：模型合法返回 [] 不能当解析失败
5. **output schema 严格**：脚本多输出的字段必须在 schema 声明（additionalProperties: false 会拦截）
6. **node 不热加载**：lib/*.js 改动必须重启宿主
7. **attachment 路径**：围栏默认放行 `<home>/.dsh/attachments`（贴图链路依赖）

## 稳定步骤
- 改插件 → 语法检查（node --check / python -m py_compile）→ mock 测试 → 重启（12 秒延迟脚本）→ 贴图实测
- 换视觉模型 = 改 config 的 apiUrl + model（任意 OpenAI 兼容多模态模型）
