import { createRouter, createWebHistory } from "vue-router"
import MainLayout from "../pages/MainLayout.vue"

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        component: () => import("../pages/Home.vue"),
      },
      {
        path: "consume",
        component: () => import("../pages/Consume.vue"),
      },
      {
        path: "add-member",
        component: () => import("../pages/AddMember.vue"),
      },
      {
        path: "member-list",
        component: () => import("../pages/MemberList.vue"),
      },
      {
        path: "about",
        component: () => import("../pages/About.vue"),
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
