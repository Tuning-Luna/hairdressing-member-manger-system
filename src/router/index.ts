import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/Home.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../pages/About.vue"),
  },
  {
    path: "/member-list",
    name: "MemberList",
    component: () => import("../pages/MemberList.vue"),
  },
  {
    path: "/consume",
    name: "Consume",
    component: () => import("../pages/Consume.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
