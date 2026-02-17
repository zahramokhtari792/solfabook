import React from 'react'
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

const HighlightModal = ({
  visible,
  onClose,
  highlights,
  onGoToHighlight,
  onRemoveHighlight,
  onClearAll,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>هایلایت‌ها</Text>

          {highlights.length === 0 ? (
            <Text style={styles.empty}>هایلایتی وجود ندارد</Text>
          ) : (
            <ScrollView style={{ maxHeight: 300 }}>
              {highlights.map((item, index) => (
                <View key={index} style={styles.item}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => onGoToHighlight(item)}
                  >
                    <Text style={styles.page}>صفحه {item.page}</Text>
                    <Text numberOfLines={2}>{item.text}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => onRemoveHighlight(index)}>
                    <Text style={styles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {highlights.length > 0 && (
            <TouchableOpacity onPress={onClearAll}>
              <Text style={{ color: 'red', marginTop: 10 }}>
                پاک کردن همه
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
            <Text>بستن</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default HighlightModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 340,
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
    marginBottom: 10,
  },
  page: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  remove: {
    color: 'red',
    marginLeft: 10,
  },
})
