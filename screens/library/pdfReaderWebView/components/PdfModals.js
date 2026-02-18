import React from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor4, themeColor5, themeColor6 } from '../../../../theme/Color';

const PdfModals = ({
    styles,
    NewStyles,
    showPageModal,
    onClosePageModal,
    pageInput,
    onChangePageInput,
    totalPages,
    onConfirmPage,
    showBookmarksModal,
    bookmarks,
    currentPage,
    onGoToBookmark,
    onToggleBookmark,
    onCloseBookmarksModal,
    showColorPicker,
    drawingColors,
    drawingColor,
    onSelectDrawingColor,
    onCloseColorPicker,
    showHighlightColorPicker,
    highlightColors,
    highlightColor,
    onSelectHighlightColor,
    onCloseHighlightColorPicker,
    showHighlightsModal,
    highlights,
    onGoToHighlight,
    onRemoveHighlight,
    onClearHighlights,
    onCloseHighlightsModal,
}) => {
    return (
        <>
            <Modal
                visible={showPageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onClosePageModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClosePageModal}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>رفتن به صفحه</Text>
                        <TextInput
                            style={styles.pageInput}
                            placeholder={`1 - ${totalPages}`}
                            placeholderTextColor={themeColor0.bgColor(0.4)}
                            value={pageInput}
                            onChangeText={onChangePageInput}
                            keyboardType="number-pad"
                            autoFocus={true}
                            selectTextOnFocus={true}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={onClosePageModal}
                            >
                                <Text style={styles.modalCancelText}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={onConfirmPage}
                            >
                                <Text style={styles.modalConfirmText}>برو</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showBookmarksModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseBookmarksModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseBookmarksModal}
                >
                    <View style={styles.bookmarksModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>صفحات نشان‌شده</Text>

                        {bookmarks.length === 0 ? (
                            <Text style={styles.noBookmarksText}>هیچ صفحه‌ای نشان نشده است</Text>
                        ) : (
                            <ScrollView style={styles.bookmarksList}>
                                {bookmarks.sort((a, b) => a - b).map((pageNum) => (
                                    <TouchableOpacity
                                        key={pageNum}
                                        style={[
                                            styles.bookmarkItem,
                                            currentPage === pageNum && styles.bookmarkItemActive,
                                            NewStyles.rowWrapper
                                        ]}
                                        onPress={() => onGoToBookmark(pageNum)}
                                    >
                                        <Text style={styles.bookmarkItemText}>
                                            صفحه {pageNum}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.removeBookmarkBtn}
                                            onPress={() => onToggleBookmark(pageNum)}
                                        >
                                            <Ionicons name="close" size={16} color={themeColor6.bgColor(0.6)} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={onCloseBookmarksModal}
                        >
                            <Text style={styles.modalCancelText}>بستن</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showColorPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseColorPicker}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseColorPicker}
                >
                    <View style={styles.colorPickerModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>انتخاب رنگ</Text>
                        <View style={styles.colorGrid}>
                            {drawingColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        drawingColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => onSelectDrawingColor(color)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={onCloseColorPicker}
                        >
                            <Text style={styles.modalCancelText}>بستن</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showHighlightColorPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseHighlightColorPicker}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseHighlightColorPicker}
                >
                    <View style={styles.colorPickerModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>انتخاب رنگ هایلایت</Text>
                        <View style={styles.colorGrid}>
                            {highlightColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        highlightColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => onSelectHighlightColor(color)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={onCloseHighlightColorPicker}
                        >
                            <Text style={styles.modalCancelText}>بستن</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showHighlightsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={onCloseHighlightsModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseHighlightsModal}
                >
                    <View style={styles.highlightsModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>هایلایت‌های ذخیره شده</Text>

                        {highlights.length === 0 ? (
                            <Text style={styles.noBookmarksText}>هیچ هایلایتی وجود ندارد</Text>
                        ) : (
                            <ScrollView style={styles.bookmarksList}>
                                {highlights.map((highlight, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.highlightItem,
                                            { borderLeftColor: highlight.color || '#ffeb3b' }
                                        ]}
                                        onPress={() => onGoToHighlight(highlight)}
                                    >
                                        <View style={styles.highlightItemContent}>
                                            <Text style={styles.highlightItemPage}>
                                                صفحه {highlight.page}
                                            </Text>
                                            <Text style={styles.highlightItemText} numberOfLines={2}>
                                                {highlight.text}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.removeBookmarkBtn}
                                            onPress={() => onRemoveHighlight(index)}
                                        >
                                            <Ionicons name="close" size={16} color={themeColor4.bgColor(0.6)} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <View style={styles.modalButtons}>
                            {highlights.length > 0 && (
                                <TouchableOpacity
                                    style={[styles.modalCancelBtn, { backgroundColor: '#ffdddd' }]}
                                    onPress={onClearHighlights}
                                >
                                    <Text style={[styles.modalCancelText, { color: '#cc0000' }]}>پاک کردن همه</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={onCloseHighlightsModal}
                            >
                                <Text style={styles.modalCancelText}>بستن</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default PdfModals;
