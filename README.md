# Whale Space Desktop

基于 Requirements.md 的桌面端前端工程骨架（Tauri + Vue3 + Element-Plus + Pinia + Vue-Router）。

## 功能范围（当前）

- 文档创建/列表/重命名/删除
- 基础编辑器（Markdown 文本输入）
- 最近访问（按更新时间）
- 深色/浅色主题（当前不持久化）
- 自动保存（当前仅内存态，刷新即丢失）

## 开发运行

1. 安装依赖

```bash
npm i
```

2. 仅运行前端（浏览器）

```bash
npm run dev
```

3. 运行 Tauri 桌面端（需要 Rust 工具链）

```bash
npm run tauri dev
```

## 目录说明

- src：渲染进程（Vue）
- src-tauri：主进程（Rust）

