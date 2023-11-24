import { ExpirationPolicy } from './expiration_policy.ts'
import { FilteringPolicy } from './filtering_policy.ts'
import { PriorityPolicy } from './priority_policy.ts'
import { RetryPolicy } from './retry_policy.ts'
import { ThrottlingPolicy } from './throttling_policy.ts'

export type Policy = {
  retry?: RetryPolicy | null
  expiration?: ExpirationPolicy | null
  priority?: PriorityPolicy | null
  throttling?: ThrottlingPolicy | null
  filters?: FilteringPolicy | null
}
