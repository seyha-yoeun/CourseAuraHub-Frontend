import { useAppToast } from '~/composables/useAppToast'
import { useReferral } from '~/composables/useReferral'

/**
 * Uses a referral code remembered from a shared link (/auth/register?ref=CODE) once the visitor has signed in,
 * whether they signed up with email or a social account. Runs after the auth plugin has restored the session.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuth()
  const { pendingCode, claimPending } = useReferral()

  watch(() => auth.isAuthenticated, async (signedIn) => {
    if (!signedIn || !pendingCode()) return
    const toast = useAppToast()
    try {
      const result = await claimPending()
      toast.success('Referral code applied', result?.referrerFirstName ? `${result.referrerFirstName} invited you. Welcome!` : undefined)
    } catch {
      // Codes only work for new learners; an expired or own code is simply dropped
    }
  }, { immediate: true })
})
