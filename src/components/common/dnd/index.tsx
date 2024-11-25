import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import type { PropsWithChildren } from "react"
import type { AllEvents, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"
import type { ElementAutoScrollArgs } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/dist/types/internal-types"
import { InstanceIdContext } from "./useSortable"

interface ContextProps extends Partial<AllEvents<ElementDragType>> {
  autoscroll?: ElementAutoScrollArgs<ElementDragType>
}
export function DndContext({ children, autoscroll, ...callback }: PropsWithChildren<ContextProps>) {
  const [instanceId] = useState<string>(randomUUID())
  useEffect(() => {
    return (
      combine(
        monitorForElements({
          canMonitor({ source }) {
            return source.data.instanceId === instanceId
          },
          ...callback,
        }),
        autoscroll ? autoScrollForElements(autoscroll) : () => { },
      )
    )
  }, [callback, instanceId, autoscroll])
  return (
    <InstanceIdContext.Provider value={instanceId}>
      {children}
    </InstanceIdContext.Provider>
  )
}
