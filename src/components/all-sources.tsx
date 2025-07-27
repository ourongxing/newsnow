import { useMemo } from "react"
import { useTitle, useWindowSize } from "react-use"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { motion } from "framer-motion"
import { sources } from "@shared/sources"
import { typeSafeObjectEntries } from "@shared/type.util"
import type { SourceID } from "@shared/types"
import { CardWrapper } from "./column/card"

const AnimationDuration = 200
const WIDTH = 350

export function AllSources() {
  const [parent] = useAutoAnimate({ duration: AnimationDuration })
  const { width } = useWindowSize()
  const minWidth = useMemo(() => {
    // double padding = 32
    return Math.min(width - 32, WIDTH)
  }, [width])

  // Get all sources that are not redirects
  const allSources = useMemo(() => {
    return typeSafeObjectEntries(sources)
      .filter(([, source]) => !source.redirect)
      .map(([id]) => id) as SourceID[]
  }, [])

  useTitle("NewsNow")

  return (
    <motion.ol
      className="grid w-full gap-6"
      ref={parent}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
      }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: 0.1,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {allSources.map(id => (
        <motion.li
          key={id}
          transition={{
            type: "tween",
            duration: AnimationDuration / 1000,
          }}
          variants={{
            hidden: {
              y: 20,
              opacity: 0,
            },
            visible: {
              y: 0,
              opacity: 1,
            },
          }}
        >
          <CardWrapper id={id} />
        </motion.li>
      ))}
    </motion.ol>
  )
}
