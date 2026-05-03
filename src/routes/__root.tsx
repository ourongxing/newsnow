import "~/styles/globals.css"
import "virtual:uno.css"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { Header } from "~/components/header"
import { GlobalOverlayScrollbar } from "~/components/common/overlay-scrollbar"
import { Footer } from "~/components/footer"
import { Toast } from "~/components/common/toast"
import { SearchBar } from "~/components/common/search-bar"
import { useAtomValue } from "jotai"
import { goToTopAtom } from "~/atoms"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const nav = Route.useNavigate()
  nav({
    to: "/",
  })
}

function GoTopButton() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  return (
    <button
      type="button"
      title="回到顶部"
      className={$(
        "fixed bottom-8 right-8 z-50 w-11 h-11 flex items-center justify-center rounded-xl shadow-lg backdrop-blur-md border transition-all-300",
        "bg-white/90 dark:bg-[#1a1d27]/90 border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.07)]",
        "hover:bg-white dark:hover:bg-[#1a1d27] hover:border-[rgba(99,102,241,0.3)] hover:shadow-xl hover:scale-105",
        ok ? "op-100 translate-y-0" : "op-0 translate-y-4 pointer-events-none",
      )}
      onClick={goToTop}
    >
      <span className="i-ph:arrow-fat-up-duotone text-xl text-[#6366f1]" />
    </button>
  )
}

function RootComponent() {
  useDark() // 初始化暗色模式
  useOnReload()
  useSync()
  usePWA()
  return (
    <>
      <GlobalOverlayScrollbar className="h-full overflow-x-auto bg-grain">
        <header
          className={$([
            "grid items-center py-4 px-5",
            "lg:(py-5)",
            "sticky top-0 z-10 backdrop-blur-xl bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(15,17,23,0.92)] border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.07)]",
          ])}
          style={{
            gridTemplateColumns: "auto 1fr auto",
          }}
        >
          <Header />
        </header>
        <main className={$([
          "mt-2 px-4 mx-auto w-full",
          "md:(px-10)",
          "lg:(px-24)",
          "min-h-[calc(100vh-180px)]",
          "md:(min-h-[calc(100vh-175px)])",
          "lg:(min-h-[calc(100vh-194px)])",
        ])}
        >
          <Outlet />
        </main>
        <footer className={$([
          "py-6 px-4 flex flex-col items-center justify-center text-sm text-neutral-500 font-mono",
          "md:(px-10)",
          "lg:(px-24)",
        ])}>
          <Footer />
        </footer>
      </GlobalOverlayScrollbar>
      <GoTopButton />
      <Toast />
      <SearchBar />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </>
  )
}
