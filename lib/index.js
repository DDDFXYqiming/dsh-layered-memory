// dsh-layered-memory v0.5 入口（薄壳）。
//
// v0.5 起源码模块化：真实实现位于 ../src/*（templates / similarity / store /
// l1index / memory-ops / maintain / search / tools / events / apply /
// skill-content），本文件仅做公共出口转发。lib 与 src 永远同步，无需打包器；
// 发布时 files 同时携带 lib 与 src。

export * from "../src/index.js";
