import { createFileRoute } from "@tanstack/react-router"
import { Column } from "~/components/column"

export const Route = createFileRoute("/")({
  component: IndexComponent,
})

function IndexComponent() {
  return <Column id="realtime" />
}
