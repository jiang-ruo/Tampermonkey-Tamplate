import { defineConfig } from 'vite'

import {headerLoadPlugin, headerPostPlugin} from "./plugins/header";
import syncPlugin from './plugins/sync';
import vue from '@vitejs/plugin-vue'

/**
 * 以head文件构建头文件时，可以使用该选项
 */
const meta = {
    version: "1.0.0"
}

export default defineConfig({
    define: {
        'process.env.NODE_ENV': '"production"'
    },
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
        vue(),
		headerLoadPlugin({
			meta,
			allowNoHead: true,
			addExportTime: true,
		}),
		headerPostPlugin(),
        {
            ...syncPlugin(),
            apply: (_, {mode}) => mode === 'sync'
        }
    ]
})