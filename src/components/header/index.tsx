import { Link } from "@tanstack/react-router"
import { useIsFetching } from "@tanstack/react-query"
import type { SourceID } from "@shared/types"
import { NavBar } from "../navbar"
import { Menu } from "./menu"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"

function GoTop() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  return (
    <button
      type="button"
      title="Go To Top"
      className={$("i-ph:arrow-fat-up-duotone", ok ? "op-50 btn" : "op-0")}
      onClick={goToTop}
    />
  )
}

function Github() {
  return (
    <button type="button" title="Github" className="i-ph:github-logo-duotone btn" onClick={() => window.open(Homepage)} />
  )
}

function Refresh() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const { refresh } = useRefetch()
  const refreshAll = useCallback(() => refresh(...currentSources), [refresh, currentSources])

  const isFetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return (type === "source" && currentSources.includes(id)) || type === "entire"
    },
  })

  return (
    <button
      type="button"
      title="Refresh"
      className={$("i-ph:arrow-counter-clockwise-duotone btn", isFetching && "animate-spin i-ph:circle-dashed-duotone")}
      onClick={refreshAll}
    />
  )
}

function ThemeToggleBtn() {
  const { isDark, toggleDark } = useDark()
  return (
    <button
      type="button"
      title={isDark ? "切换亮色" : "切换暗色"}
      className={$("btn", isDark ? "i-ph:moon-stars-duotone" : "i-ph:sun-dim-duotone")}
      onClick={toggleDark}
    />
  )
}

export function Header() {
  return (
    <>
      <span className="flex justify-self-start items-center shrink-0">
        <Link to="/" className="flex items-center no-underline">
          <span className="text-3xl font-brand line-height-none! font-bold tracking-tight whitespace-nowrap">
            <span className="text-[#6366f1]">N</span>
            <span className="text-[#1a1a2e] dark:text-[#e8eaed]">ews</span>
          </span>
        </Link>
      </span>
      <span className="justify-self-center">
        <span className="hidden md:inline-block">
          <NavBar />
        </span>
      </span>
      <span className="justify-self-end flex items-center text-base shrink-0 gap-0.5">
        <ThemeToggleBtn />
        <GoTop />
        <Refresh />
        <Github />
        <Menu />
      </span>
    </>
  )
}
