import { createApp } from 'vue'
import App from "./App.vue";

(async function() {
	// do something
    const app = createApp(App);
    // app.mount可以直接传入dom节点
    app.mount('#app');
})();