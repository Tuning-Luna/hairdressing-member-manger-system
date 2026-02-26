import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/Home.vue"),
  },
  {
    path: "/consume",
    name: "Consume",
    component: () => import("../pages/Consume.vue"),
  },
  {
    path: "/member-list",
    name: "MemberList",
    component: () => import("../pages/MemberList.vue"),
  },
  {
    path: "/add-member",
    name: "AddMember",
    component: () => import("../pages/AddMember.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../pages/About.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
