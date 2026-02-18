import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor4 } from '../../../../theme/Color';

const PdfBottomNav = ({
    styles,
    currentPage,
    totalPages,
    onGoFirst,
    onPrev,
    onNext,
    onGoLast,
    onOpenPageModal,
    bookmarksCount,
    onOpenBookmarksModal,
}) => {
    return (
        <View style={styles.bottomNavBar}>
            <ScrollView horizontal contentContainerStyle={{ gap: 15, paddingHorizontal: 20 }} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
                    onPress={onGoFirst}
                    disabled={currentPage === 1}
                >
                    <Ionicons
                        name="play-skip-back"
                        size={16}
                        color={currentPage === 1 ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
                    onPress={onPrev}
                    disabled={currentPage === 1}
                >
                    <Ionicons
                        name="chevron-back"
                        size={16}
                        color={currentPage === 1 ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.pageIndicator} onPress={onOpenPageModal}>
                    <Text style={styles.pageIndicatorText}>
                        {currentPage} / {totalPages}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
                    onPress={onNext}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={currentPage === totalPages ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
                    onPress={onGoLast}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons
                        name="play-skip-forward"
                        size={16}
                        color={currentPage === totalPages ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)}
                    />
                </TouchableOpacity>

                {bookmarksCount > 0 && (
                    <TouchableOpacity
                        style={styles.navBtn}
                        onPress={onOpenBookmarksModal}
                    >
                        <Ionicons name="bookmarks-outline" size={16} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default PdfBottomNav;
