// deno-lint-ignore-file no-explicit-any
import {
  decodeBase64url,
  encodeBase64url,
} from 'npm:@bjorkhaug/sbase64url@5.0.4'
import { Encryption } from './encryption/encryption.ts'
import { Lock } from './locks/lock.ts'
import { Metadata } from './metadata/metadata.ts'
import { Metrics } from './metrics/metrics.ts'
import { Policy } from './policies/policy.ts'

export type SerializedEvent<T = unknown, S = unknown> = {
  id: string
  type: string
  payload: {
    data: T
    schema?: S
  }
  metadata: Partial<Metadata>
  metrics: Partial<Metrics>
  policy: Partial<Policy>
  encryption: Partial<Encryption>
}

export abstract class Event {
  static parse(event: string) {
    return Object.freeze(JSON.parse(event))
  }

  static seconds(value: number) {
    const now = Date.now()
    return parseInt(String(Math.floor(now / 1000) + value))
  }

  static async encrypt(
    event: any,
    key: CryptoKey,
    algorithm_properties: { [key: string]: any } = {},
  ) {
    if (!event.encryption.algorithm) {
      throw new Error('Encryption algorithm is not set')
    }

    Object.assign(event.payload, {
      data: encodeBase64url(
        await crypto.subtle.encrypt(
          { name: event.encryption.algorithm, ...algorithm_properties },
          key,
          new TextEncoder().encode(JSON.stringify(event.payload.data)),
        ),
      ),
    })

    return event
  }

  static async decrypt(
    event: any,
    key: CryptoKey,
    algorithm_properties: { [key: string]: any } = {},
  ) {
    if (!event.encryption.algorithm) {
      throw new Error('Encryption algorithm is not set')
    }

    Object.assign(event.payload, {
      data: JSON.parse(
        new TextDecoder().decode(
          await crypto.subtle.decrypt(
            { name: event.encryption.algorithm, ...algorithm_properties },
            key,
            decodeBase64url(event.payload.data),
          ),
        ),
      ),
    })

    return event
  }

  static create<T, S>(
    name: string,
    payload: T,
    { schema }: {
      schema?: S
    } = {},
  ) {
    return new class {
      readonly id = crypto.randomUUID()

      readonly payload = Object.seal(Object.assign({
        data: Object.freeze(payload),
      }, schema ? { schema } : {}))

      metadata: Metadata = {
        name,
        timestamp: Math.floor(+(new Date()) / 1000),
      }

      locks: Partial<Lock> = {}
      metrics: Partial<Metrics> = {}
      policy: Partial<Policy> = {}
      encryption: Partial<Encryption> = {}

      setMetadata(key: keyof Metadata, value: Metadata[typeof key]) {
        Object.assign(this.metadata, { [key]: value })
        return this
      }

      setMetric(key: keyof Metrics, value: Metrics[typeof key]) {
        Object.assign(this.metrics, { [key]: value })
        return this
      }

      setPolicy(key: keyof Policy, value: Policy[typeof key]) {
        Object.assign(this.policy, { [key]: value })
        return this
      }

      setEncryption(key: keyof Encryption, value: Encryption[typeof key]) {
        Object.assign(this.encryption, { [key]: value })
        return this
      }

      setLock(key: keyof Lock, value: Lock[typeof key]) {
        Object.assign(this.locks, { [key]: value })
        return this
      }

      serialize() {
        return JSON.stringify({
          id: this.id,
          type: this.metadata.name,
          payload: this.payload,
          metadata: this.metadata,
          metrics: this.metrics,
          policy: this.policy,
          encryption: this.encryption,
        })
      }

      toString() {
        return this.serialize()
      }

      toJSON() {
        return this.serialize()
      }

      toEvent() {
        return new CustomEvent(this.metadata.name, {
          detail: this.serialize(),
        })
      }
    }()
  }
}
