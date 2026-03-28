import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/intel")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/intel"!</div>
}
