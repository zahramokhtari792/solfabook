import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0 } from '../../../../theme/Color';

const PdfSearchBar = ({
    styles,
    searchQuery,
    onChangeSearch,
    onClearSearch,
    searchResultCount,
    currentSearchIndex,
    onPrevResult,
    onNextResult,
    onCloseSearch,
}) => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="جستجو در PDF..."
                    placeholderTextColor={themeColor0.bgColor(0.5)}
                    value={searchQuery}
                    onChangeText={onChangeSearch}
                    autoFocus={true}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity style={styles.clearSearchBtn} onPress={onClearSearch}>
                        <Text style={{ color: themeColor0.bgColor(1), fontSize: 18 }}>×</Text>
                    </TouchableOpacity>
                )}
            </View>

            {searchResultCount > 0 && (
                <View style={styles.searchNavigation}>
                    <Text style={styles.searchResultText}>
                        {currentSearchIndex} از {searchResultCount}
                    </Text>
                    <TouchableOpacity style={styles.navButton} onPress={onPrevResult}>
                        <Ionicons name="chevron-up" size={12} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton} onPress={onNextResult}>
                        <Ionicons name="chevron-down" size={12} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                </View>
            )}

            {searchQuery.length > 0 && searchResultCount === 0 && (
                <Text style={styles.noResultText}>نتیجه‌ای یافت نشد</Text>
            )}

            <TouchableOpacity style={styles.closeSearchBtn} onPress={onCloseSearch}>
                <Text style={styles.closeSearchText}>بستن</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PdfSearchBar;
