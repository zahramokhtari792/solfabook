import React from 'react'
import { useAppTheme } from '../../context/ThemeProvider'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

const ColorPickerModal = ({
  visible,
  onClose,
  colors,
  selectedColor,
  onSelect,
  title = 'انتخاب رنگ',
}) => {
  const { colors: themeColors } = useAppTheme()
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: themeColors.surface }]} onStartShouldSetResponder={() => true}>
          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>

          <View style={styles.grid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.circle,
                  { borderColor: themeColors.border },
                  { backgroundColor: color },
                  selectedColor === color && styles.selected,
                  selectedColor === color && { borderColor: themeColors.text },
                ]}
                onPress={() => onSelect(color)}
              />
            ))}
          </View>

          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: themeColors.text }}>بستن</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default ColorPickerModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selected: {
    borderColor: '#000',
    borderWidth: 3,
  },
})
