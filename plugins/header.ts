import { Plugin } from 'vite';
import {GmFunctions, UserScript} from "../header/UserScript";
import {readFileSync} from "fs";
import format from "string-template";

const padLen = 20

const buildHeaderFromIndex = (script: UserScript) => {
    let result = '// ==UserScript==\n'
    if (script.name) {
        result += '// @name'.padEnd(padLen, ' ') + script.name + '\n'
    }
    if (script.namespace) {
        result += '// @namespace'.padEnd(padLen, ' ') + script.namespace + '\n'
    }
    if (script.version) {
        result += '// @version'.padEnd(padLen, ' ') + script.version + '\n'
    }
    if (script.author) {
        result += '// @author'.padEnd(padLen, ' ') + script.author + '\n'
    }
    if (script.description) {
        result += '// @description '.padEnd(padLen, ' ') + script.description + '\n'
    }
    if (script.homepage) {
        result += '// @homepage'.padEnd(padLen, ' ') + script.homepage + '\n'
    }
    if (script.icon) {
        result += '// @icon'.padEnd(padLen, ' ') + script.icon + '\n'
    }
    if (script.icon64) {
        result += '// @icon64'.padEnd(padLen, ' ') + script.icon64 + '\n'
    }
    if (script.updateURL) {
        result += '// @updateURL'.padEnd(padLen, ' ') + script.updateURL + '\n'
    }
    if (script.supportURL) {
        result += '// @supportURL'.padEnd(padLen, ' ') + script.supportURL + '\n'
    }
    if (script.downloadURL) {
        result += '// @downloadURL'.padEnd(padLen, ' ') + script.downloadURL + '\n'
    }
    if (script.includes) {
        script.includes.forEach(include => {
            result += '// @include'.padEnd(padLen, ' ') + include + '\n'
        })
    }
    if (script.matches) {
        script.matches.forEach(m => {
            result += '// @match'.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.excludes) {
        script.excludes.forEach(exclude => {
            result += '// @exclude'.padEnd(padLen, ' ') + exclude + '\n'
        })
    }
    if (script.requires) {
        script.requires.forEach(m => {
            result += '// @require'.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.resources) {
        script.resources.forEach(m => {
            result += '// @resource '.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.connect) {
        result += '// @connect'.padEnd(padLen, ' ') + script.connect + '\n'
    }
    if (script.runAt) {
        result += '// @run-at'.padEnd(padLen, ' ') + script.runAt + '\n'
    }
    if (script.grants) {
        function grantParser(grant: string | GmFunctions) {
            if (typeof grant === 'string') {
                return '// @grant'.padEnd(padLen, ' ') + grant + '\n';
            } else {
                return '// @grant'.padEnd(padLen, ' ') + GmFunctions[grant] + '\n';
            }
        }
        const grants: Array<string | GmFunctions> = Array.isArray(script.grants) ? script.grants : [script.grants];
        for (const grant of grants) {
            result += grantParser(grant);
        }
    }
    if (script.noframes) {
        //此处之前少了 “//”，感谢 没礼貌的芬兰人 的评论
        //https://gitee.com/ironV/tampermonkey-typescript/blob/master/header/build.ts#note_12538220
        result += '// @noframes\n'
    }
    if (script.nocompat) {
        result += '// @nocompat'.padEnd(padLen, ' ') + script.nocompat + '\n'
    }
    if (script.license) {
        result += `// @license ${script.license}\n`
    }
    result += '// ==/UserScript==\n'



    if (script.comment) {
        result += '//\n'
        function parseCommentString(comment: string): string {
            // 检测是否包含换行符
            if (comment.includes('\n')) {
                return comment.split('\n')
                    .map(line => parseCommentString(line))
                    .join('\n');
            } else {
                // 去除左侧的空格后检测是否以//开始
                if (comment.trimStart().startsWith('//')) {
                    return comment.trimStart();
                } else {
                    return `// ${comment}`;
                }
            }
        }
        if (typeof script.comment === 'string') {
            result += `${parseCommentString(script.comment)}\n`
        } else {
            script.comment.forEach(c => {
                result += `${parseCommentString(c)}\n`
            })
        }
    }
    if (script.declares) {
        if (typeof script.declares === 'string') {
            result += `/* global ${script.declares} */\n`
        } else {
            script.declares.forEach(d => {
                result += `/* global ${d} */\n`
            })
        }
    }

    return result;
}

const HEAD_FILE_INDEX = "header/index.ts"
const HEAD_FILE_HEAD = "header/head";

const readHeaderFile = (opt?: Option): UserScript | string | undefined =>  {
    try{
        console.log(`加载Tampermonkey头声明文件: ${HEAD_FILE_INDEX}`)
        const hf = `../${HEAD_FILE_INDEX}`;
        const script: UserScript = require(hf).default
        return script;
    } catch (e1) {
        try {
            console.log(`${HEAD_FILE_INDEX}加载失败`)
            console.log(`加载Tampermonkey头声明文件: ${HEAD_FILE_HEAD}`)
            const header: string = readFileSync(`./${HEAD_FILE_HEAD}`, 'utf-8');
            const result = opt?.meta ? format(header, opt.meta) : header;
            // // 最后一个符号不是\n则添加\n
            // return result.endsWith('\n') ? result : result + '\n';
            return result;
        } catch (e2) {
            console.error("\x1b[31m%s\x1b[0m", "Tampermoney头声明文件加载失败");
            if (opt?.allowNoHead) return;
            const e1NotSupported = e1 instanceof Error && e1.message === `Dynamic require of "../${HEAD_FILE_INDEX}" is not supported`
            if (!e1NotSupported) throw e1;
            const e2Enoent = e2 instanceof Error && "code" in e2 && e2.code === "ENOENT";
            if (!e2Enoent) throw e2;
            throw new Error(`未找到Tampermonkey头声明文件${HEAD_FILE_INDEX}或${HEAD_FILE_HEAD}`)
        }
    }
}

const loadHeader = (opt?: Option): string | undefined =>  {
    const script = readHeaderFile(opt);
    if(!script) return "";
    if(typeof script === 'string') {
        return script;
    } else {
        return buildHeaderFromIndex(script);
    }
}

function currentTime() {
    const now = new Date();

    // 获取年份
    const year = now.getFullYear();

    // 获取月份（注意月份从0开始，需要+1）
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // 获取日期
    const day = String(now.getDate()).padStart(2, '0');

    // 获取小时
    const hours = String(now.getHours()).padStart(2, '0');

    // 获取分钟
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // 获取秒钟
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 获取毫秒（需要确保是3位数）
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // 组合成所需格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 *
 * @returns 如果存在header/index.ts文件，则优先从index.ts中构造header，
 *          如果不存在，则从header/head中直接读取header
 */
const buildHeader = (opt?: Option): string => {
    const script = loadHeader(opt);
    const date = opt.addExportTime ? `// ${currentTime()}\n\n` : "";
    if(!script) return date;
    const ndate = date ? "\n" + date : "\n\n";
    return script.trim() + ndate;
}

type Option = {
    // 用于字符串模板的元数据
    meta?: {[key in string]: any},
    // 是否允许head为空
    allowNoHead?: boolean,
    addExportTime?: boolean
}

const HEADER_NAME = "header.txt"

const headerLoadPlugin = (opt?: Option): Plugin => {
    return {
        name: 'header-load-plugin',
        generateBundle(_, bundle) {
            // vite的日志默认没有换行，这里手动添加换行
            console.log();
            const header: string = buildHeader(opt);
            bundle[HEADER_NAME] = {
                type: 'asset',
                name: HEADER_NAME,
                fileName: HEADER_NAME,
                source: header,
                needsCodeReference: false,
                names: [],
                originalFileName: "./header/",
                originalFileNames: []
            }
        }
    }
}

const headerPostPlugin = (): Plugin => {
    return {
        name: 'header-post-plugin',
        enforce: 'post',
        generateBundle(_, bundle) {
            console.log("header-post-plugin")
            const header = bundle[HEADER_NAME]
            if (header === undefined) {
                throw new Error("未检测到header资源，请先添加headerLoadPlugin插件")
            }
            if (header.type !== "asset") {
                throw new Error("header资源类型错误，期望为asset类型")
            }
            const main = bundle['main.js']
            if (main === undefined) {
                throw new Error("未检测到main.js资源")
            }
            if (main.type !== "chunk") {
                throw new Error("main.js资源类型错误，期望为chunk类型")
            }
            main.code = header.source + main.code;
            delete bundle[HEADER_NAME]
        }
    }
}

export {headerLoadPlugin, headerPostPlugin, readHeaderFile, HEAD_FILE_INDEX, HEAD_FILE_HEAD}