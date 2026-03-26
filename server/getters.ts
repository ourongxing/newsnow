import type { SourceID } from "@shared/types"
import * as x from "glob:./sources/{*.ts,**/index.ts}"
import type { SourceGetter } from "./types"

export const getters = (function () {
  const getters = {} as Record<SourceID, SourceGetter>
  typeSafeObjectEntries(x).forEach(([id, x]) => {
    if (x.default instanceof Function) {
      Object.assign(getters, { [id]: x.default })
    } else {
      Object.assign(getters, x.default)
    }
  })
  return getters
})()

export const sourcesGetters = getters
