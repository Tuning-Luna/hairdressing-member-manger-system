import { ref, watch } from "vue"

type ThemeMode = "light" | "dark" | "system"

const THEME_KEY = "theme-mode"

// 当前模式（light / dark / system）
const mode = ref<ThemeMode>("system")

// 是否是暗黑（真正控制UI的）
const isDark = ref(false)

// 读取系统主题
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

// 初始化
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null

  if (saved) {
    mode.value = saved
  } else {
    mode.value = "system"
  }

  updateTheme()
}

function updateTheme() {
  if (mode.value === "dark") {
    isDark.value = true
  } else if (mode.value === "light") {
    isDark.value = false
  } else {
    // system
    isDark.value = mediaQuery.matches
  }

  applyTheme(isDark.value)
}

// 监听 mode 变化
watch(mode, () => {
  localStorage.setItem(THEME_KEY, mode.value)
  updateTheme()
})

// 如果是 system 模式，监听系统变化
mediaQuery.addEventListener("change", () => {
  if (mode.value === "system") {
    updateTheme()
  }
})

initTheme()

export function useTheme() {
  return {
    mode,
    isDark,
  }
}
