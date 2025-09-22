# NPCPro 技术规范

## 1. 项目概览
- **产品目标**：围绕影视作品角色叙事生成的全栈应用。用户输入电影名称与角色后，系统检索数据库素材并调用 AI Agent 生成第一人称叙事。
- **核心能力**：影片与角色资料管理、剧情/对白文本管理、角色叙事生成、主题切换与状态提示。
- **当前实现状态**：前端已提供首页与管理后台原型；后端实现影片、角色、剧情、对白等增删改查接口以及叙事占位接口；AI Agent 调用仍为占位逻辑，鉴权接口尚未实现。

## 2. 技术栈与运行环境
- **前端**：React 18、TypeScript、Vite、React Router、Zustand、Tailwind CSS、lucide-react 图标。
- **后端**：Node.js 20+、Express 4、TypeScript、mysql2/promise、dotenv、cors。
- **构建与工具**：Vite + `@vitejs/plugin-react`，`vite-tsconfig-paths` 提供 `@` 别名；ESLint 9 + TypeScript ESLint；TailwindCSS；Nodemon + `tsx` 热重载。
- **数据库**：MySQL（脚本位于 `db/mysql_schema.sql` 与 `db/mysql_schema_comments.sql`）。`scripts/seed.ts` 提供示例数据灌入。
- **部署**：Vercel Serverless 入口 `api/index.ts`，`vercel.json` 负责 `/api/*` 重写；本地开发通过 `npm run dev` 并使用 Vite 代理转发 `/api` 请求至 3001 端口。
- **环境变量**：`.env` 对应 MySQL 连接配置 (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CONNECTION_LIMIT`)；其它服务（AI Agent、鉴权）后续扩展时按需补充。

## 3. 目录结构约定
```
api/                 Express 应用、路由、数据库工具
  ├─ app.ts          服务初始化、中间件配置与路由挂载
  ├─ server.ts       本地开发入口（nodemon）
  ├─ index.ts        Vercel Serverless 入口
  ├─ lib/            数据库连接、HTTP 响应帮助、行数据转换
  └─ routes/         各业务域 REST API（影片、角色、剧情、对白、叙事等）
src/                 前端 React 源码
  ├─ pages/          页面级组件（Home, Admin）
  ├─ components/     可复用基础组件（如 Empty 状态）
  ├─ hooks/          状态管理 Hook（主题、叙事 Store）
  ├─ lib/            API 请求封装、公共类型与工具函数
  ├─ assets/         前端静态资源（如需）
  └─ main.tsx        入口文件，挂载 React 应用
public/              静态文件（编译时直接拷贝）
db/                  MySQL 建表、注释与示例数据脚本
scripts/             数据初始化脚本（TypeScript 版本）
配置文件            `vite.config.ts`、`tailwind.config.js`、`eslint.config.js`、`nodemon.json` 等
```

## 4. 前端规范
- **路由**：`src/App.tsx` 通过 React Router 配置 `/`（Home）与 `/admin`（管理后台），可按需扩展子路由。
- **状态管理**：
  - `useNarrativeStore` 使用 Zustand 管控叙事请求状态，统一暴露 `generateNarrative` 与 `reset`。
  - `useTheme` 负责主题切换，读取 `localStorage` 并同步 `document.documentElement` 的类名，遵循 Tailwind `darkMode: class` 设定。
- **UI 与样式**：整体采用 Tailwind Utility 类；复杂类名可借助 `clsx` 与 `tailwind-merge` (`cn` 工具) 做合并。深浅色模式需覆盖 `dark:` 前缀样式。
- **API 调用**：`src/lib/api.ts` 封装所有 REST 请求，统一返回 `success: true/false` 结构并抛出错误，前端组件需捕获并友好提示。新增接口时请在此集中维护。
- **类型管理**：`src/lib/types.ts` 提供前后端共享的请求/响应与实体类型，扩展字段需同步更新后端映射。
- **组件约定**：
  - 页面组件使用 PascalCase 命名（如 `Home.tsx`）。
  - 公共组件放置于 `src/components`，保持无状态、可复用，必要时配套 Props 类型。
  - 尽量保持表单、状态与 UI 分离，复杂交互拆分小组件。
- **国际化与文本**：当前界面文案为中文；若后续支持多语言，需要引入 i18n 方案并抽离文案。

## 5. 后端规范
- **应用初始化**：`api/app.ts` 加载 `dotenv`、设置 `cors`、JSON/URL-encoded 解析器，统一挂载带 `/api` 前缀的路由，并定义健康检查 `/api/health` 与兜底 404、500 处理器。
- **数据库访问**：
  - `api/lib/db.ts` 使用 `mysql2/promise` 创建连接池，提供 `query`（返回数据行）与 `execute`（返回 `ResultSetHeader`）。
  - 所有 SQL 使用命名占位符 `:param`，防止注入。
- **数据转换**：`api/lib/transformers.ts` 将数据库行转换为 `src/lib/types.ts` 定义的实体，包含 JSON 字段解析与类型安全处理。
- **响应规范**：统一返回 `{ success: boolean, data?: T, error?: string }`；
  - 成功：`sendSuccess(res, data, status?)` 或 `sendCreated`。
  - 失败：`sendError(res, message, status?, details?)`。
- **路由划分**：
  - `/api/auth/*`：鉴权占位接口，均返回 501。
  - `/api/movies`：影片 CRUD 与检索（支持 `search`、`limit`、`offset`）。
  - `/api/movies/:movieId/characters`、`/api/characters/:id`：角色管理。
  - `/api/movies/:movieId/scenes`、`/api/scenes/:id`：场景管理。
  - `/api/movies/:movieId/subtitle-segments`、`/api/subtitle-segments/:id`：对白片段管理，支持分页。
  - `/api/references`、`/api/character-notes`：参考资料与角色笔记管理。
  - `/api/movies/:movieId/scripts`、`/api/movie-scripts/:id`：剧本文本上传与删除。
  - `/api/movies/:movieId/dialogues`、`/api/movie-dialogues/:id`：对白全文上传与删除。
  - `/api/narrative`：叙事生成（当前返回占位文本）。
- **验证与清洗**：各路由文件通过独立 `sanitize*Payload` 函数验证请求体，
  - 必填字段校验（如电影标题、角色名称）。
  - 数字/布尔字段转换，数组字段序列化为 JSON 字符串（入库前）。
- **错误处理**：捕获 SQL 或校验异常后返回 4xx/5xx，日志打印详细错误信息。
- **代码组织**：
  - 新增业务域时在 `api/routes` 里创建路由模块，并在 `app.ts` 挂载。
  - 复用公共逻辑（如分页、输入校验）可放入 `api/lib`。

## 6. 数据模型概述
- `movies`：影片基本信息（标题、原名、年份、语言、片长、类型、海报、简介）。
- `characters`：角色档案（所属影片、别名、演员、描述、特质 JSON、主角标记、创建人/更新时间）。
- `scenes`：场景切片（场次编号、起止毫秒、地点、概述）。
- `subtitle_segments`：字幕片段（关联场景/角色、起止时间、台词文本、置信度、来源）。
- `movie_scripts`：影片剧本/剧情文本（标题、剧情摘要、全量剧本文本）。
- `movie_dialogue_files`：对白文本文件（文件名、对白全文、行数统计）。
- 其他参考表（如 `references`、`character_notes`）可在 `mysql_schema.sql` 查看详细字段与外键关系。
- 所有主键采用 UUID，时间字段默认 `CURRENT_TIMESTAMP`，部分 JSON 字段需手动序列化。

## 7. API 交互格式
- **请求与响应格式**：默认 `application/json`，通过 Fetch API 发送。
- **成功响应**：`{ "success": true, "data": <实体或列表> }`。列表响应通常包含 `pagination { limit, offset, count }`。
- **失败响应**：`{ "success": false, "error": "错误信息", "details": 可选 }`。
- **叙事接口示例**：
  - 请求：`POST /api/narrative`，体为 `{ movieTitle, characterName, promptModifiers? }`。
  - 响应：`{ success: true, data: { story, movieTitle, characterName, generatedAt, tokensUsed?, cached? } }`。
- **鉴权**：暂未实现，未来可在请求头加入 Token 并在中间件验证。

## 8. 开发流程与命令
- 安装依赖：`npm install`
- 本地同时启动前后端：`npm run dev`
  - 前端：Vite 运行于 5173，代理 `/api` 到 3001。
  - 后端：Nodemon + `tsx` 监听 `api/` 目录，热重载。
- 仅启动前端：`npm run client:dev`
- 仅启动后端：`npm run server:dev`
- 代码检查：`npm run lint`
- 类型检查：`npm run check`
- 生产构建：`npm run build`，构建后可通过 `npm run preview` 做页面冒烟测试。
- 数据初始化：在确保数据库连接配置正确后执行 `tsx scripts/seed.ts`（或 `node scripts/seed.mjs`）。

## 9. 编码风格与最佳实践
- 语言统一为 TypeScript，前端/后端共享类型定义于 `src/lib/types.ts`。
- 命名约定：组件使用 PascalCase，变量/函数使用 camelCase，文件采用 kebab-case（React 组件除外）。
- 遵循 ESLint 规则，尤其是 React Hooks 依赖与导出限制；新增 Hook 需满足 `use*` 命名规范。
- 控制注释密度：仅在复杂逻辑处添加简洁注释，避免冗长描述。
- 表单输入需做前端与后端双重校验，错误提示保持中文语义一致。
- Tailwind 工具类优先，避免额外 CSS；必要时在组件同目录引入 `index.css`。
- API 变更需同步更新前端请求封装、类型与相关 UI。
- 在提交前至少执行 `npm run lint`，确保无警告或已文档化例外情况。

## 10. 部署与运维要点
- 本地与生产环境均通过 `.env` 管理敏感信息，不提交到仓库。
- Vercel 部署：
  - 静态资源由 Vite 构建后托管。
  - 所有 `/api/*` 请求重写到 `api/index.ts`，使用同一 Express 实例响应。
- 日志：开发环境在 Vite 代理层打印请求日志，后端 `console.error` 输出异常；生产环境需接入集中日志方案（后续规划）。
- 安全：当前尚未实现鉴权/速率限制，后续需在中间件增加 Token 验证与限流。

## 11. 后续规划与待办
- 接入真实 AI Agent 服务，补全 Prompt 构建、缓存策略与错误兜底。
- 完成鉴权模块（注册、登录、Token 管理），并将管理后台受控于登录态。
- 扩展角色叙事 API：支持多段输出、分章节结构、引用场景/台词片段。
- 补齐自动化测试（推荐 Vitest + React Testing Library），从 `src/__tests__/` 开始搭建。
- 增加前端体验：结果导出、收藏、历史记录、角色切换。
- 数据层：完善索引、增加视图或物化视图，加速检索与统计。

> 本文档需随功能迭代及时更新，确保前后端协同及新成员快速上手。
