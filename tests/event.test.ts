import { assert } from 'https://deno.land/std@0.182.0/_util/asserts.ts'
import { Event, Listener } from '../mod.ts'

const TestEvents = new EventTarget()

Deno.test('Event', async () => {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    [
      'encrypt',
      'decrypt',
    ],
  )

  const event = Event.create('user.request.create', {
    name: 'John Doe',
    email: 'john.doe@example.com',
  })
    .setMetadata('description', 'Create a new user')
    .setPolicy('retry', {
      expires_at: Event.seconds(60 * 5),
    })
    .setEncryption('algorithm', 'AES-GCM')

  const iv = crypto.getRandomValues(new Uint8Array(12))

  await Event.encrypt(event, key, {
    iv,
  })

  const decrypted = await Event.decrypt(event, key, { iv })

  assert(decrypted.payload.data.name === 'John Doe')
  assert(decrypted.metadata.description === 'Create a new user')
  assert(decrypted.policy.retry.expires_at > 0)
})

Deno.test('TestEvent', async () => {
  await new Promise<void>((resolve) => {
    using listener = new Listener(TestEvents, 'test', (event) => {
      assert(typeof event.id === 'string')
      resolve()
    })

    listener.dispatch(Event.create('test', { name: 'Hello world' }))
  })
})
