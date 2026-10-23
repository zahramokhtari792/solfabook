import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';
import { imageUri } from '../services/URL';
import { useAppTheme } from '../context/ThemeProvider';
import InstrumentImageZoom from './InstrumentImageZoom';

// The API sends paths relative to /storage. An absolute URL is also supported.
export const instrumentMediaUrl = (path) => {
    if (typeof path !== 'string' || !path.trim()) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${imageUri}/${path.replace(/^\/+/, '')}`;
};

export const instrumentSlides = (instrument) => {
    const result = [];
    const existing = new Set();
    const add = (type, path) => {
        const url = instrumentMediaUrl(path);
        if (!url || !['image', 'video'].includes(type) || existing.has(`${type}:${url}`)) return;
        existing.add(`${type}:${url}`);
        result.push({ type, uri: url });
    };

    // Supports data from old API responses as well as records with a new gallery.
    add('image', instrument?.image_path);
    if (Array.isArray(instrument?.gallery)) {
        instrument.gallery.forEach(item => add(item?.type, item?.path));
    } else if (Array.isArray(instrument?.media)) {
        instrument.media.forEach(item => add(item?.type, item?.path));
    }
    return result;
};

export default function InstrumentMediaGallery({ instrument, onVideoPlay }) {
    const { width: screenWidth } = useWindowDimensions();
    const [layoutWidth, setLayoutWidth] = useState(screenWidth);
    const [activeIndex, setActiveIndex] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [zoomUri, setZoomUri] = useState(null);
    const { colors } = useAppTheme();
    const slides = useMemo(() => instrumentSlides(instrument), [instrument]);

    if (!slides.length) return null;

    return (
        <View style={{ backgroundColor: colors.surface }} onLayout={(e) => {
            const measured = e.nativeEvent.layout.width;
            if (measured > 0 && Math.abs(measured - layoutWidth) > 1) setLayoutWidth(measured);
        }}>
            <View style={[styles.mediaViewport, { backgroundColor: colors.surface }]}>
                <FlatList
                    data={slides}
                    keyExtractor={(item, i) => `${item.type}:${item.uri}:${i}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    key={layoutWidth}
                    initialScrollIndex={0}
                    getItemLayout={(_items, index) => ({ length: layoutWidth, offset: layoutWidth * index, index })}
                    onScrollBeginDrag={() => setPlayingIndex(null)}
                    onMomentumScrollEnd={(event) => {
                        const next = Math.max(0, Math.min(slides.length - 1, Math.round(event.nativeEvent.contentOffset.x / layoutWidth)));
                        setActiveIndex(next);
                        setPlayingIndex(null);
                    }}
                    renderItem={({ item, index }) => (
                        <View style={[styles.slide, { width: layoutWidth, backgroundColor: colors.surface }]}>
                            {item.type === 'video' ? (
                                <View style={styles.videoWrap}>
                                    {index === activeIndex ? (
                                        <Video
                                            source={{ uri: item.uri }}
                                            style={styles.media}
                                            resizeMode="contain"
                                            paused={playingIndex !== index}
                                            controls
                                            onEnd={() => setPlayingIndex(null)}
                                            onError={(error) => console.warn('SolfaSaz video playback error', error)}
                                        />
                                    ) : null}
                                    {index === activeIndex && playingIndex !== index && (
                                        <Pressable
                                            style={styles.playOverlay}
                                            onPress={() => { onVideoPlay?.(); setPlayingIndex(index); }}
                                            accessibilityRole="button"
                                            accessibilityLabel="Play video"
                                        >
                                            <Ionicons name="play-circle" size={60} color="#FFFFFF" />
                                        </Pressable>
                                    )}
                                </View>
                            ) : (
                                <Pressable
                                    style={styles.media}
                                    onPress={() => { setPlayingIndex(null); setZoomUri(item.uri); }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Zoom image"
                                >
                                    <Image source={{ uri: item.uri }} style={styles.media} resizeMode="contain" />
                                </Pressable>
                            )}
                        </View>
                    )}
                />
                {slides[activeIndex]?.type === 'image' && (
                    <Pressable
                        style={styles.zoomHint}
                        onPress={() => { setPlayingIndex(null); setZoomUri(slides[activeIndex].uri); }}
                        accessibilityRole="button"
                        accessibilityLabel="Zoom image"
                    >
                        <Ionicons name="expand-outline" color="#FFFFFF" size={21} />
                    </Pressable>
                )}
            </View>
            {slides.length > 1 && (
                <View style={styles.pagination}>
                    {slides.map((_slide, index) => (
                        <View key={index} style={[
                            styles.dot,
                            { backgroundColor: activeIndex === index ? colors.primary : colors.textSecondary,
                              opacity: activeIndex === index ? 1 : 0.45 },
                        ]} />
                    ))}
                    <Text style={[styles.count, { color: colors.textSecondary }]}>{activeIndex + 1} / {slides.length}</Text>
                </View>
            )}
            <InstrumentImageZoom uri={zoomUri} onClose={() => setZoomUri(null)} />
        </View>
    );
}

const styles = StyleSheet.create({
    mediaViewport: { aspectRatio: 1.5 },
    slide: { aspectRatio: 1.5, justifyContent: 'center', alignItems: 'center' },
    media: { width: '100%', height: '100%' },
    videoWrap: { width: '100%', height: '100%', backgroundColor: '#000000' },
    playOverlay: { position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
    zoomHint: { position: 'absolute', right: 12, bottom: 12, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.45)', padding: 7, borderRadius: 20 },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    count: { marginLeft: 8, fontSize: 12 },
});
