import { useState } from 'react'
import * as FileSystem from 'expo-file-system'

export default function usePdfLoader(url) {
  const [base64, setBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const download = async () => {
    try {
      setLoading(true)
      setError(null)

      const fileUri = FileSystem.cacheDirectory + 'temp.pdf'
      const result = await FileSystem.downloadAsync(url, fileUri)

      if (result.status !== 200) throw new Error('Download failed')

      const b64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      setBase64(b64)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { base64, loading, error, download }
}