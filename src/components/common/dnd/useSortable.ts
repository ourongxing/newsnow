import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source"
import { createContext } from "react"

export const InstanceIdContext = createContext<string | null>(null)

interface SortableProps {
  id: string
}

interface DraggableState {
  type: "idle" | "dragging"
  container?: HTMLElement
}

export function useSortable(props: SortableProps) {
  const instanceId = useContext(InstanceIdContext)
  const [draggableState, setDraggableState] = useState<DraggableState>({
    type: "idle",
  })
  useEffect(() => {
    if (draggableState.type === "idle") {
      document.querySelector("html")?.classList.remove("grabbing")
    } else if (draggableState.type === "dragging") {
      // https://github.com/SortableJS/Vue.Draggable/issues/815#issuecomment-1552904628
      setTimeout(() => {
        document.querySelector("html")?.classList.add("grabbing")
      }, 50)
    }
  }, [draggableState])
  const [handleRef, setHandleRef] = useState<HTMLElement | null>(null)
  const [nodeRef, setNodeRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (handleRef && nodeRef) {
      const cleanup = combine(
        draggable({
          element: nodeRef,
          dragHandle: handleRef,
          getInitialData: () => ({ id: props.id, instanceId }),
          onGenerateDragPreview({ nativeSetDragImage, location }) {
            setCustomNativeDragPreview({
              getOffset: preserveOffsetOnSource({
                element: nodeRef,
                input: location.current.input,
              }),
              render({ container }) {
                container.style.width = `${nodeRef.clientWidth}px`
                setDraggableState({ type: "dragging", container })
              },
              nativeSetDragImage,
            })
          },
          onDrop: () => {
            setDraggableState({ type: "idle" })
          },
        }),
        dropTargetForElements({
          element: nodeRef,
          getData: () => ({ id: props.id }),
          getIsSticky: () => true,
          canDrop: ({ source }) => source.data.instanceId === instanceId,
        }),
      )
      return cleanup
    }
  }, [props.id, instanceId, handleRef, nodeRef])
  return {
    setHandleRef,
    setNodeRef,
    isDragging: draggableState.type === "dragging",
    OverlayContainer: draggableState.container,
  }
}
