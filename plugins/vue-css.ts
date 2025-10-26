/**
 * @author XiaoLOrange
 * @time 2025.10.26
 * @title
 */
import { Plugin } from 'vite';
import {HEADER_NAME} from "./header";

function hasGrant(header: string, grant: string): boolean {
	// 更精确的油猴脚本@name匹配
	// 1. 首先检查是否在UserScript块中
	const userScriptMatch = header.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
	if (!userScriptMatch) return false;
	// 2. 在UserScript块中匹配@grant
	const userScriptContent = userScriptMatch[0];
	// 3. 构造正则表达式转义grant参数中的特殊字符，特别是点号
	const escapedGrant = grant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	return new RegExp(`@grant\\s+${escapedGrant}`).test(userScriptContent);
}

/**
 * 手动创建style标签
 * @param css
 */
function defaultCode(css: string): string {
	return `const style = document.createElement('style');
style.textContent = \`${css}\`;
document.head.appendChild(style);\n`
}

function addStyleCode(css: string): string {
	return `GM_addStyle(\`${css}\`);\n`
}

function addElementCode(css: string): string {
	return `GM_addElement('style', { textContent: \`${css}\` });\n`
}

function newAddStyleCode(css: string): string {
	throw new Error("GM.addStyle");
}

function newAddElementCode(css: string): string {
	throw new Error("GM.addElement");
}

const vueCssPlugin = (): Plugin => {
	return {
		name: 'inline-css',
		enforce: 'post',
		generateBundle(_, bundle) {
			const header = bundle[HEADER_NAME];
			let func: (css: string) => string;
			// header.js文件不存在，则直接返回
			if (header && header.type === "asset") {
				const headerContent = header.source as string;
				// 检查是否有@grant GM_addStyle或GM_addElement
				if (hasGrant(headerContent, "GM_addStyle")) {
					func = addStyleCode;
				} else if (hasGrant(headerContent, "GM_addElement")) {
					func = addElementCode;
				} else if (hasGrant(headerContent, "GM.addStyle")) {
					func = newAddStyleCode;
				} else if (hasGrant(headerContent, "GM.addElement")) {
					func = newAddElementCode;
				} else {
					func = defaultCode;
				}
			} else {
				func = defaultCode;
			}

			const jsfile = bundle['main.js'];
			// main.js文件不存在，则直接返回
			if (!(jsfile && jsfile.type === "chunk")) return;

			// 获取CSS文件
			const cssFilenames = Object.keys(bundle).filter(file => file.endsWith('.css'));


			let css = "";
			// 将css添加到js文件开头
			for (let cssFilename of cssFilenames) {
				const cssfile = bundle[cssFilename];
				console.log(cssFilename + ": " + cssfile.type)
				if (cssfile.type !== "asset") continue;

				// 使用GM_addStyle函数将CSS添加到页面（油猴脚本环境）
				css += func(cssfile.source as string);

				// 删除原始CSS文件
				delete bundle[cssFilename];
			}
			// 将css添加到js文件开头
			jsfile.code = css + jsfile.code;
		}
	}
}

export default vueCssPlugin;
