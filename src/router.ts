/**
 * @author XiaoLOrange
 * @time 2025.10.23
 * @title
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import type {RouteRecordRaw} from 'vue-router'
import Component1 from './components/Component1.vue'
import Component2 from './components/Component2.vue'

const routes: RouteRecordRaw[] = [
	{
		path: '/Component1',
		component: Component1
	},
	{
		path: '/Component2',
		component: Component2
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})

export default router;