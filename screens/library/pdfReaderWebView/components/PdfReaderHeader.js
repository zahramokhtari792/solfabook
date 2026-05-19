import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { themeColor0, themeColor5 } from '../../../../theme/Color';
import BackArrowIcon from './../../../../assets/svg/BackArrowIcon';
import SearchIcon from './../../../../assets/svg/SearchIcon';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const PdfReaderHeader = ({
    NewStyles,
    styles,
    drawingMode,
    drawingColor,
    strokeWidth,
    highlighterMode,
    drawingOpacity,
    onToggleDrawingMode,
    onOpenDrawingColorPicker,
    onChangeStrokeWidth,
    onToggleHighlighterMode,
    onChangeDrawingOpacity,
    onUndoDrawing,
    onClearAllDrawings,
    hasHighlights,
    onOpenHighlightsModal,
    onToggleSearch,
    isBookmarked,
    onToggleBookmark,
    onBack,
    downloadedPdf,
    downloadPdf,
    downloadingPdf
}) => {

    const user = useSelector(state => state.user?.data);
    const navigation = useNavigation();
    return (
        <View style={[styles.header, NewStyles.rowWrapper]}>
            <View style={[NewStyles.row, { flex: 1, flexWrap: 'wrap' }]}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                        if (!downloadedPdf) {
                            if (user?.is_offline_mode == 1) {
                                downloadPdf();
                            } else {
                                navigation.navigate('Subscription');
                            }
                        }
                    }}
                    disabled={downloadingPdf}
                >
                    {downloadingPdf ? (
                        <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />
                    ) : downloadedPdf ? (
                        <Ionicons name="checkmark-circle" size={24} color={themeColor0.bgColor(1)} />
                    ) : (
                        <Ionicons name="download-outline" size={24} color={themeColor0.bgColor(1)} />
                    )}
                </TouchableOpacity>
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

                        {/* Stroke Width Controls */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
                            <TouchableOpacity
                                style={[styles.iconButton, { padding: 6 }]}
                                onPress={() => onChangeStrokeWidth(Math.max(1, strokeWidth - 2))}
                            >
                                <Ionicons name="remove-circle-outline" size={16} color={themeColor0.bgColor(1)} />
                            </TouchableOpacity>
                            <Text style={{ color: themeColor0.bgColor(1), fontSize: 11, minWidth: 25, textAlign: 'center' }}>
                                {strokeWidth}px
                            </Text>
                            <TouchableOpacity
                                style={[styles.iconButton, { padding: 6 }]}
                                onPress={() => onChangeStrokeWidth(Math.min(50, strokeWidth + 2))}
                            >
                                <Ionicons name={'add-circle'} size={16} color={themeColor0.bgColor(1)} />
                            </TouchableOpacity>
                        </View>

                        {/* Highlighter Mode Toggle */}
                        <TouchableOpacity
                            style={[styles.iconButton, highlighterMode && styles.iconButtonActive]}
                            onPress={onToggleHighlighterMode}
                        >
                            <Ionicons
                                name="color-fill"
                                size={20}
                                color={themeColor0.bgColor(1)}
                            />
                        </TouchableOpacity>

                        {/* Opacity Controls */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 }}>
                            <TouchableOpacity
                                style={[styles.iconButton, { padding: 6 }]}
                                onPress={() => onChangeDrawingOpacity(Math.max(0.1, Math.round((drawingOpacity - 0.1) * 10) / 10))}
                            >
                                <Ionicons name="remove-circle-outline" size={16} color={themeColor0.bgColor(1)} />

                            </TouchableOpacity>
                            <Text style={{ color: themeColor0.bgColor(1), fontSize: 10, minWidth: 30, textAlign: 'center' }}>
                                {Math.round(drawingOpacity * 100)}%
                            </Text>
                            <TouchableOpacity
                                style={[styles.iconButton, { padding: 6 }]}
                                onPress={() => onChangeDrawingOpacity(Math.min(1, Math.round((drawingOpacity + 0.1) * 10) / 10))}
                            >
                                <Ionicons name={'add-circle'} size={16} color={themeColor0.bgColor(1)} />

                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.iconButton} onPress={onUndoDrawing}>
                            <Ionicons name="arrow-undo" size={24} color={themeColor0.bgColor(1)} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={onClearAllDrawings}>
                            <MaterialCommunityIcons name={"eraser"} size={24} color={themeColor0.bgColor(1)} />
                        </TouchableOpacity>
                    </>
                )}




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
