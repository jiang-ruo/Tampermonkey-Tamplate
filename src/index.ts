import {register, route} from "./router.ts";

function page1() {

}
(async function() {
	// do something
	register(route('/page1', page1));
})();