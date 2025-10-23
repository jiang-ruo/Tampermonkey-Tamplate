/**
 * @author XiaoLOrange
 * @time 2025.10.23
 * @title
 */

declare module '*.vue' {
	import { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}
