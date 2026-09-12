# DSH 插件测试流程

插件逻辑可以先在独立 headless profile 中验证，避免影响已运行的 Web 实例。

先运行语法检查和已有模拟测试，再用配置了目标插件的 headless profile 验证技能加载、工具调用与结果回读。涉及界面或宿主生命周期时，另做交互验证。

```sh
node --check lib/index.js
dsh plugin --profile headless add <plugin-path>
dsh --profile headless "Load the plugin skill and verify the required tool."
```

已运行的宿主通常不会重新加载修改后的 JavaScript。需要验证新代码时启动独立测试实例，并单独配置所需插件。不要把已有会话的结果当成新代码的测试结果。
