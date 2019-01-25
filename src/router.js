import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import firebase from 'firebase'

Vue.use(Router)

//export default new Router({
const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
            meta: {
                requiresAuth: true
            }
        }
    ],

})
export default router

router.beforeEach((to, from, next) => {
    if (to.matched.some(routedeclaration => routedeclaration.meta.requiresAuth)) {
        if (!firebase.auth().currentUser) {
            next({
                path: '/',
                //query: {redirect: to.fullPath}
            })
        } else {
            next() // ca passe
        }
    } else {
        next() // hop
    }
})