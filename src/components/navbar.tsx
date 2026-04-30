import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  return (
    <span className={$([
      "flex items-center gap-2 p-1.5 rounded-2xl",
      "bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(17,19,30,0.8)] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]",
      "backdrop-blur-md",
    ])}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "nav-link op-70 hover:op-100",
        )}
      >
        更多
      </button>
      {fixedColumnIds.map(columnId => (
        <Link
          key={columnId}
          to="/c/$column"
          params={{ column: columnId }}
          className={$(
            "nav-link",
            currentId === columnId ? "nav-link-active" : "op-70 hover:op-100",
          )}
        >
          {metadata[columnId].name}
        </Link>
      ))}
    </span>
  )
}
