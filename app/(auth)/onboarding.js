import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1545241047-6083a36ee221?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        title: 'We provide high\nquality plants just\nfor you',
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        title: 'Your satisfaction is\nour number one\npriority',
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        title: 'Let\'s Shop Your\nFavorite Plants with\nPotea Now!',
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef(null);

    const updateCurrentSlideIndex = e => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex != slides.length) {
            const offset = nextSlideIndex * width;
            ref?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        } else {
            router.replace('/(auth)/lets-you-in');
        }
    };

    const skip = () => {
        router.replace('/(auth)/lets-you-in');
    };

    const renderItem = ({ item }) => {
        return (
            <View style={{ alignItems: 'center', width }}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={skip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={slides}
                pagingEnabled
                renderItem={renderItem}
                bounces={false}
            />

            <View style={styles.footerContainer}>
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex == index && styles.activeIndicator
                            ]}
                        />
                    ))}
                </View>
                <Button
                    title={currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={goToNextSlide}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    headerContainer: { alignItems: 'flex-end', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
    skipText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    image: { height: width * 1.2, width: width, marginBottom: SPACING.xl },
    textContainer: { paddingHorizontal: SPACING.lg },
    title: { ...TYPOGRAPHY.h1, textAlign: 'center', lineHeight: 40 },
    footerContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    indicatorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg },
    indicator: { height: 8, width: 8, backgroundColor: COLORS.border, marginHorizontal: 3, borderRadius: 4 },
    activeIndicator: { backgroundColor: COLORS.primary, width: 32 },
});
