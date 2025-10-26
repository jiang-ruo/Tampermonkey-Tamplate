import { Plugin } from 'vite';
import fs, {readFileSync} from 'fs'
import path from 'path'
import {HEAD_FILE_INDEX} from "./header";
import {UserScript} from "../header/UserScript";

const getScript = (): UserScript | { name: string } | undefined => {
    try{
        const hf = `../${HEAD_FILE_INDEX}`;
        const script: UserScript = require(hf).default
        return script;
    } catch (e1) {
        try {
            // 这里不能直接使用plugins/header#readHeaderFile的结果，因为缺少opt.meta数据
            const main: string = readFileSync(`./dist/main.js`, 'utf-8');
            // 更精确的油猴脚本@name匹配
            // 1. 首先检查是否在UserScript块中
            const userScriptMatch = main.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
            if (!userScriptMatch) throw new Error("解析Tampermonkey头声明失败")
            // 2. 在UserScript块中匹配@name
            const userScriptContent = userScriptMatch[0];
            const nameMatch = userScriptContent.match(/@name\s+([^\r\n]+)/);
            if (nameMatch) {
                const name = nameMatch[1].trim();
                return { name };
            }
        } catch (e2) {
            const e1NotSupported = e1 instanceof Error && e1.message === `Dynamic require of "../${HEAD_FILE_INDEX}" is not supported`
            if (!e1NotSupported) throw e1;
            throw e2;
        }
    }
}

const syncPlugin = (): Plugin => {
    return {
        name: 'sync-plugin',
        closeBundle(){
            let script = getScript();
            if(!script) return;
            const files = fs.readdirSync('temp/Tampermonkey/sync',{ withFileTypes: true })
            const jsonFiles = files.filter(file => file.isFile() && file.name.endsWith('.meta.json'))
            for(const file of jsonFiles){
                const filePath = path.join('temp/Tampermonkey/sync', file.name);
                const content = fs.readFileSync(filePath, 'utf-8')
                const {uuid,name} = JSON.parse(content);
                if(name === script.name){
                    const jsName = path.join('temp/Tampermonkey/sync',`${uuid}.user.js`)
                    fs.copyFileSync('dist/main.js',jsName)
                    console.log('copied file to:', jsName)
                    return;
                }
            }

            throw new Error("找不到对应名称的脚本:" + script.name)
        }
    }
}

export { syncPlugin }
