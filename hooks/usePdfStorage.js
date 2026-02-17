import AsyncStorage from '@react-native-async-storage/async-storage'

export default function usePdfStorage(fileId) {

  const load = async (key) => {
    const data = await AsyncStorage.getItem(`${key}_${fileId}`)
    return data ? JSON.parse(data) : null
  }

  const save = async (key, value) => {
    await AsyncStorage.setItem(
      `${key}_${fileId}`,
      JSON.stringify(value)
    )
  }

  return {
    loadHighlights: () => load('pdf_highlights'),
    saveHighlights: (data) => save('pdf_highlights', data),

    loadBookmarks: () => load('pdf_bookmarks'),
    saveBookmarks: (data) => save('pdf_bookmarks', data),

    loadDrawings: () => load('pdf_drawings'),
    saveDrawings: (data) => save('pdf_drawings', data),
  }
}
