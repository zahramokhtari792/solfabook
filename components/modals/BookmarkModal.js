import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'

const BookmarkModal = ({
  visible,
  onClose,
  bookmarks,
  currentPage,
  onGoToPage,
  onRemoveBookmark,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>صفحات نشان‌شده</Text>

          {bookmarks.length === 0 ? (
            <Text style={styles.empty}>هیچ صفحه‌ای نشان نشده</Text>
          ) : (
            <ScrollView style={{ maxHeight: 300 }}>
              {bookmarks.map((page) => (
                <View key={page} style={styles.item}>
                  <TouchableOpacity onPress={() => onGoToPage(page)}>
                    <Text
                      style={[
                        styles.pageText,
                        currentPage === page && styles.active,
                      ]}
                    >
                      📄 صفحه {page}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onRemoveBookmark(page)}>
                    <Text style={styles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text>بستن</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default BookmarkModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pageText: {
    fontSize: 14,
  },
  active: {
    fontWeight: 'bold',
    color: '#961d5a',
  },
  remove: {
    color: 'red',
  },
  closeBtn: {
    marginTop: 15,
    alignSelf: 'center',
  },
})
