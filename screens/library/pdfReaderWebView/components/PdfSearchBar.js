import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor6 } from '../../../../theme/Color';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t("Search in PDF")}
                    placeholderTextColor={themeColor0.bgColor(0.5)}
                    value={searchQuery}
                    onChangeText={onChangeSearch}
                    autoFocus={true}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity style={styles.clearSearchBtn} onPress={onClearSearch}>
                       <Ionicons name='close' size={20} color={themeColor6.bgColor(1)} />
                    </TouchableOpacity>
                )}
            </View>

            {searchResultCount > 0 && (
                <View style={styles.searchNavigation}>
                    <Text style={styles.searchResultText}>
                        {currentSearchIndex} {t("From")} {searchResultCount}
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
                <Text style={styles.noResultText}>{t("No results found")}</Text>
            )}

            <TouchableOpacity style={styles.closeSearchBtn} onPress={onCloseSearch}>
                <Text style={styles.closeSearchText}>{t("Close")}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PdfSearchBar;
