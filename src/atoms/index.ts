import type { FixedColumnID, SourceID } from "@shared/types"
import { sources } from "@shared/sources"
import { typeSafeObjectEntries } from "@shared/type.util"
import type { Update } from "./types"

export const focusSourcesAtom = atom((get) => {
  return get(primitiveMetadataAtom).data.focus
}, (get, set, update: Update<SourceID[]>) => {
  const _ = update instanceof Function ? update(get(focusSourcesAtom)) : update
  set(primitiveMetadataAtom, {
    updatedTime: Date.now(),
    action: "manual",
    data: {
      ...get(primitiveMetadataAtom).data,
      focus: _,
    },
  })
})

export const currentColumnIDAtom = atom<FixedColumnID>("hottest")

export const currentSourcesAtom = atom(() => {
  // 返回所有非重定向的源
  return typeSafeObjectEntries(sources).filter(([, v]) => !v.redirect).map(([k]) => k)
})

export const goToTopAtom = atom({
  ok: false,
  el: undefined as HTMLElement | undefined,
  fn: undefined as (() => void) | undefined,
})
