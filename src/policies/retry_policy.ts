export type RetryPolicy = {
  type?: 'fixed' | 'exponential'
  delay?: number
  max_attempts?: number
  max_delay?: number
  backoff_base?: number
  jitter?: boolean
}
