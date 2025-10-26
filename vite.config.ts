import { defineConfig } from 'vite'

import headerPlugin from "./plugins/header";
import syncPlugin from './plugins/sync';

/**
 * 以head文件构建头文件时，可以使用该选项
 */
const meta = {
    version: "1.0.0"
}

export default defineConfig({
    build: {
        lib:{
            entry: 'src/index.ts',
            name: 'main',
            fileName: 'main',
            formats: ['es']
        },
        // 编译时进行压缩
        minify: false,
        outDir: 'dist'
    },
    plugins: [
        headerPlugin({
            meta,
            allowNoHead: true,
            // addExportTime: true,
        }),
        {
            ...syncPlugin(),
            apply: (_, {mode}) => mode === 'sync'
        }
    ]
})