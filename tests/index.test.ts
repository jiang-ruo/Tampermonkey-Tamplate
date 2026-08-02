import { describe, expect, it } from 'vitest'

import { GmFunctions } from '../header/UserScript'

/**
 * 示例测试：验证测试环境已正确配置。
 *
 * 实际使用建议：
 * - 将 src/ 中可测试的纯逻辑抽成可导出的函数/模块，然后在 tests/ 中编写对应的 .test.ts。
 * - 若测试逻辑涉及 GM_* 全局函数，可在 vitest.config.ts 中配置 jsdom/happy-dom 环境，
 *   并通过 vi.stubGlobal 进行模拟。
 */
describe('GmFunctions 枚举', () => {
    it('GM_getValue 的字符串形式对应 GM.getValue', () => {
        // 数字枚举：GM_getValue 在第 17 位（从 0 开始），对应值 17
        expect(GmFunctions.GM_getValue).toBe(25)
        // 字符串枚举："GM.getValue" 仍属于同一数字枚举成员
        expect(GmFunctions['GM.getValue']).toBe(GmFunctions.GM_getValue + 1)
    })
})
