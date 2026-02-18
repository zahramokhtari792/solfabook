import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  
import { themeColor0, themeColor5 } from '../../../../theme/Color';
import BackArrowIcon from './../../../../assets/svg/BackArrowIcon';
import SearchIcon from './../../../../assets/svg/SearchIcon';

const PdfReaderHeader = ({
    NewStyles,
    styles,
    drawingMode,
    drawingColor,
    onToggleDrawingMode,
    onOpenDrawingColorPicker,
    onUndoDrawing,
    onClearAllDrawings,
    textSelected,
    onApplyHighlight,
    highlightColor,
    onOpenHighlightColorPicker,
    hasHighlights,
    onOpenHighlightsModal,
    onToggleSearch,
    onClearHighlights,
    isBookmarked,
    onToggleBookmark,
    onBack,
}) => {
    return (
        <View style={[styles.header, NewStyles.rowWrapper]}>
            <View style={[NewStyles.row, { flex: 1, flexWrap: 'wrap' }]}>
                <TouchableOpacity
                    style={[styles.iconButton, drawingMode && styles.iconButtonActive]}
                    onPress={onToggleDrawingMode}
                >
                    <Ionicons name="pencil" size={18} color={themeColor0.bgColor(1)} />
                </TouchableOpacity>

                {drawingMode && (
                    <>
                        <TouchableOpacity
                            style={[styles.colorPickerBtn, { backgroundColor: drawingColor }]}
                            onPress={onOpenDrawingColorPicker}
                        />
                        <TouchableOpacity style={styles.iconButton} onPress={onUndoDrawing}>
                            <Ionicons name="arrow-undo" size={24} color={themeColor0.bgColor(1)} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={onClearAllDrawings}>
                            <Ionicons name="trash" size={24} color={themeColor0.bgColor(1)} />
                        </TouchableOpacity>
                    </>
                )}

                {textSelected && (
                    <TouchableOpacity
                        style={[styles.highlightApplyButton, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                        onPress={onApplyHighlight}
                    >
                        <Ionicons name="brush" size={14} color={themeColor5.bgColor(1)} />
                        <Text style={styles.highlightApplyButtonText}>هایلایت</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.colorPickerBtn, { backgroundColor: highlightColor }]}
                    onPress={onOpenHighlightColorPicker}
                />

                {hasHighlights && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onOpenHighlightsModal}
                    >
                        <Ionicons name="clipboard-outline" size={24} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.iconButton} onPress={onToggleSearch}>
                    <SearchIcon color={themeColor0.bgColor(1)} />
                </TouchableOpacity>

                {hasHighlights && (
                    <TouchableOpacity style={styles.clearButton} onPress={onClearHighlights}>
                        <Text style={styles.clearButtonText}>پاک کردن</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.navBtn, isBookmarked && styles.bookmarkActive, { backgroundColor: themeColor0.bgColor(0) }]}
                    onPress={onToggleBookmark}
                >
                    <Ionicons
                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color={themeColor0.bgColor(1)}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <BackArrowIcon color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
        </View>
    );
};

export default PdfReaderHeader;
