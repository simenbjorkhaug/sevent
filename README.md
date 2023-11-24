# @bjorkhaug/sevent

## Description

`@bjorkhaug/sevent` is an event creation library that helps maintain a
consistent event contract across services. It provides functionalities for event
encryption, policy management, and metrics tracking on events.

## Usage

```typescript
import { Event } from '@bjorkhaug/sevent'

const event = Event.create('user.request.create', {
  name: 'John Doe',
  email: 'john.doe@example.com',
})
  .setMetadata('description', 'Create a new user')
  .setPolicy('retry', {
    expires_at: Event.seconds(60 * 5),
  })
  .setEncryption('algorithm', 'AES-GCM')
```
