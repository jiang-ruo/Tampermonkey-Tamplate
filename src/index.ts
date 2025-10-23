import { createApp } from 'vue'
import App from "./App.vue";
import router from './router'

(async function() {
	// do something
    const app = createApp(App);
    app.use(router)
    // app.mount可以直接传入dom节点
    app.mount('#app');
})();