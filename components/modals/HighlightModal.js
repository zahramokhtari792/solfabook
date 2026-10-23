import React from 'react'
import { useAppTheme } from '../../context/ThemeProvider'
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
  const { colors } = useAppTheme()
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
          <Text style={[styles.title, { color: colors.text }]}>هایلایت‌ها</Text>

          {highlights.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>هایلایتی وجود ندارد</Text>
          ) : (
            <ScrollView style={{ maxHeight: 300 }}>
              {highlights.map((item, index) => (
                <View key={index} style={styles.item}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => onGoToHighlight(item)}
                  >
                    <Text style={[styles.page, { color: colors.text }]}>صفحه {item.page}</Text>
                    <Text style={{ color: colors.text }} numberOfLines={2}>{item.text}</Text>
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
            <Text style={{ color: colors.text }}>بستن</Text>
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
