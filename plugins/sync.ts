import { Plugin } from 'vite';
import fs from 'fs'
import path from 'path'
import {readHeaderFile} from "./header";
import {UserScript} from "../header/UserScript";

const getScript = (): UserScript | { name: string } | undefined => {
    // 想要实时同步到油猴，就必须要头部
    const content = readHeaderFile();
    if (!content) return;
    if (typeof content !== "string") return content;
    // 更精确的油猴脚本@name匹配
    // 1. 首先检查是否在UserScript块中
    const userScriptMatch = content.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    if (!userScriptMatch) return;

    // 2. 在UserScript块中匹配@name
    const userScriptContent = userScriptMatch[0];
    const nameMatch = userScriptContent.match(/@grant\s+([^\r\n]+)/);
    if (nameMatch) {
        const name = nameMatch[1].trim();
        return { name };
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
