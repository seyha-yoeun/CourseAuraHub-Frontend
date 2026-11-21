export interface VapidKey {
  publicKey: string | null
  // Whether this server can send push at all
  enabled: boolean
}

export interface PushSubscriptionStatus {
  subscribed: boolean
  devices: number
}

export interface PushPreference {
  type: string
  enabled: boolean
}
