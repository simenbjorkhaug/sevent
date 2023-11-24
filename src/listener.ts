// deno-lint-ignore-file no-explicit-any
import { SerializedEvent } from './event.ts'

export class Listener implements Disposable {
  #listener: string
  #handler: (e: any) => void

  #eventTarget: EventTarget

  constructor(
    eventTarget: EventTarget,
    listener: string,
    handler: (e: SerializedEvent) => void,
  ) {
    this.#listener = listener
    this.#handler = (e: any) => handler(JSON.parse(e.detail))
    this.#eventTarget = eventTarget
    this.#eventTarget.addEventListener(
      this.#listener,
      this.#handler,
    )
  }

  dispatch(event: any) {
    return this.#eventTarget.dispatchEvent(event.toEvent())
  }

  [Symbol.dispose]() {
    this.#eventTarget.removeEventListener(
      this.#listener,
      this.#handler,
    )
  }
}
