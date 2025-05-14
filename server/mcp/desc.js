import sources from "../../shared/sources.json"

export const description = Object.entries(sources).filter(([_, source]) => {
  if (source.redirect) {
    return false
  }
  return true
}).map(([id, source]) => {
  return source.title ? `${source.name}-${source.title} id is ${id}` : `${source.name} id is ${id}`
}).join(";")
