import { defineConfig } from 'vitest/config'

/**
 * Vitest 测试配置（独立于 vite.config.ts）
 *
 * 说明：
 * - vitest 加载配置时，vitest.config.ts 的优先级高于 vite.config.ts，
 *   因此这里不需要也不应包含油猴构建专用的 header/sync 插件。
 * - 测试文件统一放在 tests/ 目录，命名格式为 *.test.ts。
 *
 * 按需扩展：
 * - 若需要覆盖率报告，安装 @vitest/coverage-v8，并取消下方 coverage 注释，
 *   运行 `vitest run --coverage`。
 * - 涉及 GM_* API（GM_getValue、GM_xmlhttpRequest 等）时，
 *   用 vi.stubGlobal('GM_getValue', mockFn) 模拟。
 */
export default defineConfig({
    test: {
        // 使用 Jest 风格全局 API（describe / it / expect），测试文件无需手动 import
        globals: true,
        // 测试文件匹配规则（测试目录约定为 tests/）
        include: ['tests/**/*.test.ts'],
        // 油猴脚本会操作 DOM，使用 happy-dom 模拟浏览器环境（纯逻辑测试同样能跑）
        environment: 'happy-dom',
        // coverage: {
        //     include: ['src/**/*.ts'],
        // },
    },
})