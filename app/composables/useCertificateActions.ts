import { useAppToast } from '~/composables/useAppToast'
import { useLearning } from '~/composables/useLearning'
import { toApiError } from '~/utils/apiError'

/** What a learner can do with a certificate, wherever it is listed. */
export function useCertificateActions() {
  const { downloadCertificate } = useLearning()
  const toast = useAppToast()
  const downloading = ref(false)

  async function download(certificateNumber: string) {
    downloading.value = true
    try {
      await downloadCertificate(certificateNumber)
    } catch (err) {
      toast.error('Download failed', toApiError(err, 'Unable to download the certificate').message)
    } finally {
      downloading.value = false
    }
  }

  async function copyLink(certificateNumber: string) {
    const url = new URL(`/certificates/${certificateNumber}`, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Verification link copied', 'Anyone with the link can confirm this certificate.')
    } catch {
      toast.error('Could not copy the link', url)
    }
  }

  return { downloading, download, copyLink }
}
