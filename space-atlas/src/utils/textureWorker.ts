/// <reference lib="webworker" />
import { paintSome, type ProceduralKey } from './proceduralPixels'

const scope = self as unknown as DedicatedWorkerGlobalScope
scope.onmessage = (e: MessageEvent<ProceduralKey[]>) => {
  paintSome(e.data, (key, px) => scope.postMessage({ key, px }, [px.data.buffer]))
}
