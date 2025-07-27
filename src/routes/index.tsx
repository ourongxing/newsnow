import { createFileRoute } from "@tanstack/react-router"
import { AllSources } from "~/components/all-sources"

export const Route = createFileRoute("/")({
  component: IndexComponent,
})

function IndexComponent() {
  return <AllSources />
}
