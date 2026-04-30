import type { NewsItem, SourceID, SourceResponse } from "@shared/types"
import { useQuery } from "@tanstack/react-query"
import { motion, useInView } from "framer-motion"
import { useWindowSize } from "react-use"
import { forwardRef, useImperativeHandle } from "react"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import { safeParseString } from "~/utils"

export interface ItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  id: SourceID
  /**
   * 是否显示透明度，拖动时原卡片的样式
   */
  isDragging?: boolean
  setHandleRef?: (ref: HTMLElement | null) => void
}

interface NewsCardProps {
  id: SourceID
  setHandleRef?: (ref: HTMLElement | null) => void
}

export const CardWrapper = forwardRef<HTMLElement, ItemsProps>(({ id, isDragging, setHandleRef, style, ...props }, dndRef) => {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
  })

  useImperativeHandle(dndRef, () => ref.current! as HTMLDivElement)

  return (
    <div
      ref={ref}
      className={$(
        "flex flex-col h-500px rounded-xl cursor-default overflow-hidden",
        "transition-all-300",
        isDragging && "op-50",
        "bg-white dark:bg-[#1a1d27] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.07)] hover:border-[rgba(99,102,241,0.3)]",
      )}
      style={{
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    >
      {inView && <NewsCard id={id} setHandleRef={setHandleRef} />}
    </div>
  )
})

function NewsCard({ id, setHandleRef }: NewsCardProps) {
  const { refresh } = useRefetch()
  const { data, isFetching, isError } = useQuery({
    queryKey: ["source", id],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1] as SourceID
      let url = `/s?id=${id}`
      const headers: Record<string, any> = {}
      if (refetchSources.has(id)) {
        url = `/s?id=${id}&latest`
        const jwt = safeParseString(localStorage.getItem("jwt"))
        if (jwt) headers.Authorization = `Bearer ${jwt}`
        refetchSources.delete(id)
      } else if (cacheSources.has(id)) {
        // wait animation
        await delay(200)
        return cacheSources.get(id)
      }

      const response: SourceResponse = await myFetch(url, {
        headers,
      })

      function diff() {
        try {
          if (response.items && sources[id].type === "hottest" && cacheSources.has(id)) {
            response.items.forEach((item, i) => {
              const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
              item.extra = {
                ...item?.extra,
                diff: o === -1 ? undefined : o - i,
              }
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      diff()

      cacheSources.set(id, response)
      return response
    },
    placeholderData: prev => prev,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { isFocused, toggleFocus } = useFocusWith(id)

  return (
    <>
      <div className={$("flex justify-between items-center px-4 py-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.07)] rounded-t-xl")}>
        <div className="flex gap-2.5 items-center min-w-0">
          <a
            className={$("w-7 h-7 rounded-lg bg-cover flex-shrink-0 ring-1 ring-[rgba(0,0,0,0.08)] dark:ring-[rgba(255,255,255,0.08)]")}
            target="_blank"
            href={sources[id].home}
            title={sources[id].desc}
            style={{
              backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
            }}
          />
          <span className="flex flex-col min-w-0">
            <span className="flex items-center gap-2">
              <span
                className="text-[13px] font-bold text-[#1a1a2e] dark:text-[#e8eaed] truncate"
                title={sources[id].desc}
              >
                {sources[id].name}
              </span>
              {sources[id]?.title && <span className={$("text-[11px] font-medium shrink-0", `color-${sources[id].color} px-1.5 py-0.5 rounded-md bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)]`)}>{sources[id].title}</span>}
            </span>
            <span className="text-[11px] text-[#8888a0] dark:text-[#5c6378]"><UpdatedTime isError={isError} updatedTime={data?.updatedTime} /></span>
          </span>
        </div>
        <div className={$("flex gap-1.5 text-base shrink-0", `color-${sources[id].color}`)}>
          <button
            type="button"
            className={$("btn", isFetching ? "animate-spin i-ph:circle-dashed-duotone" : "i-ph:arrow-counter-clockwise-duotone")}
            onClick={() => refresh(id)}
          />
          <button
            type="button"
            className={$("btn", isFocused ? "i-ph:star-fill" : "i-ph:star-duotone")}
            onClick={toggleFocus}
          />
          {setHandleRef && (
            <div
              ref={setHandleRef}
              className={$("btn cursor-grab i-ph:dots-six-vertical-duotone")}
            />
          )}
        </div>
      </div>

      <OverlayScrollbar
        className={$([
          "h-full overflow-y-auto rounded-xl",
          isFetching && `animate-pulse`,
        ])}
        options={{
          overflow: { x: "hidden" },
        }}
        defer
      >
        <div className={$("transition-opacity-500", isFetching && "op-20")}>
          {!!data?.items?.length && (sources[id].type === "hottest" ? <NewsListHot items={data.items} /> : <NewsListTimeLine items={data.items} />)}
        </div>
      </OverlayScrollbar>
    </>
  )
}

function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return `${relativeTime}更新`
  if (isError) return "获取失败"
  return "加载中..."
}

function ExtraInfo({ item }: { item: NewsItem }) {
  if (item?.extra?.info) {
    return <>{item.extra.info}</>
  }
  if (item?.extra?.icon) {
    const { url, scale } = typeof item.extra.icon === "string" ? { url: item.extra.icon, scale: undefined } : item.extra.icon
    return (
      <img
        src={url}
        style={{
          transform: `scale(${scale ?? 1})`,
        }}
        className="h-4 inline mt--1"
        onError={e => e.currentTarget.style.display = "none"}
      />
    )
  }
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const relativeTime = useRelativeTime(date)
  return <>{relativeTime}</>
}
function NewsListHot({ items }: { items: NewsItem[] }) {
  const { width } = useWindowSize()
  return (
    <ol className="flex flex-col">
      {items?.map((item, i) => (
        <a
          href={width < 768 ? item.mobileUrl || item.url : item.url}
          target="_blank"
          key={item.id}
          title={item.extra?.hover}
          className={$(
            "flex gap-3 items-start py-2 px-3.5 relative group cursor-pointer feed-item-link",
            "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)]",
            "hover:before:content-empty hover:before:absolute hover:before:left-0 hover:before:top-0 hover:before:bottom-0 hover:before:w-[2.5px] hover:before:bg-[#6366f1]",
            "border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0",
          )}
        >
          <span
            className={$(
              "min-w-[25px] h-[25px] flex justify-center items-center rounded-md text-[11.5px] font-bold shrink-0",
              i === 0 ? "bg-[rgba(251,191,36,0.18)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]" :
              i === 1 ? "bg-[rgba(156,163,175,0.15)] text-[#9ca3af] border border-[rgba(156,163,175,0.28)]" :
              i === 2 ? "bg-[rgba(205,124,74,0.15)] text-[#cd7c4a] border border-[rgba(205,124,74,0.28)]" :
              "bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[#8888a0] dark:text-[#5c6378]",
            )}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#1a1a2e] dark:text-[#e2e8f0] leading-[1.5] line-clamp-2 group-hover:text-[#000] dark:group-hover:text-white transition-colors-200">
              {item.title}
            </div>
            <div className="text-[11px] text-[#8888a0] dark:text-[#5c6378] mt-[3px] truncate">
              <ExtraInfo item={item} />
            </div>
          </div>
          <span className="shrink-0 text-[#8888a0] dark:text-[#5c6378] text-[11px] ml-1 mt-1 op-0 group-hover:op-100 transition-opacity-200">→</span>
        </a>
      ))}
    </ol>
  )
}

function NewsListTimeLine({ items }: { items: NewsItem[] }) {
  const { width } = useWindowSize()
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "NewsArticle",
              "headline": item.title,
              "url": width < 768 ? item.mobileUrl || item.url : item.url,
              "datePublished": item.pubDate || item?.extra?.date,
              "publisher": {
                "@type": "Organization",
                "name": item.source || "NewsNow",
                "url": item.sourceUrl || "https://shishixinwen.news",
              },
            },
          })),
        })}
      </script>
      <ol className="flex flex-col">
        {items?.map((item, i) => (
          <a
            href={width < 768 ? item.mobileUrl || item.url : item.url}
            target="_blank"
            key={`${item.id}-${item.pubDate || item?.extra?.date || ""}`}
            className={$(
              "flex gap-3 items-start py-2 px-3.5 relative group cursor-pointer feed-item-link",
              "hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.03)]",
              "hover:before:content-empty hover:before:absolute hover:before:left-0 hover:before:top-0 hover:before:bottom-0 hover:before:w-[2.5px] hover:before:bg-[#6366f1]",
              "border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-[#8888a0] dark:text-[#5c6378] mb-[3px]">
                {(item.pubDate || item?.extra?.date) && <NewsUpdatedTime date={(item.pubDate || item?.extra?.date)!} />}
                <span className="ml-2"><ExtraInfo item={item} /></span>
              </div>
              <div className="text-[13px] font-medium text-[#1a1a2e] dark:text-[#e2e8f0] leading-[1.5] line-clamp-2 group-hover:text-[#000] dark:group-hover:text-white transition-colors-200">
                {item.title}
              </div>
            </div>
            <span className="shrink-0 text-[#8888a0] dark:text-[#5c6378] text-[11px] ml-1 mt-1 op-0 group-hover:op-100 transition-opacity-200">→</span>
          </a>
        ))}
      </ol>
    </>
  )
}
