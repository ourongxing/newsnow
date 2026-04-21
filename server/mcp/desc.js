import sources from "../../shared/sources.json"

const entries = Object.entries(sources).filter(([_, source]) => {
  if (source.redirect) {
    return false
  }
  return true
})

export const description = entries.map(([id, source]) => {
  return source.title ? `${source.name}-${source.title} id is ${id}` : `${source.name} id is ${id}`
}).join(";")

/**
 * Returns a human-readable list of available sources, one per line.
 * Used by the `list_sources` MCP tool so LLMs can discover valid ids.
 */
export function sourceList() {
  return entries.map(([id, source]) => {
    const label = source.title ? `${source.name} - ${source.title}` : source.name
    return `${id}: ${label}`
  }).join("\n")
}
