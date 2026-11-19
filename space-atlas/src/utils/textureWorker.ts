/// <reference lib="webworker" />
import { paintAll } from './proceduralPixels'

paintAll((key, px) => {
  ;(self as unknown as DedicatedWorkerGlobalScope).postMessage({ key, px }, [px.data.buffer])
})
;(self as unknown as DedicatedWorkerGlobalScope).postMessage({ done: true })
