import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, TextInput, ScrollView, Dimensions, Animated
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import { PLANTS, CATEGORIES } from '../constants/data';
import LayoutContainer from '../components/LayoutContainer';
import { useResponsive } from '../utils/responsive';
import { useAuth } from '../contexts/AuthContext';


const BANNERS = [
    {
        id: '1',
        title: 'Special Offer!\n30% Off',
        subtitle: 'Get the best indoor plants at amazing prices',
        image: 'https://images.unsplash.com/photo-1545241047-6083a36ee221?auto=format&fit=crop&w=600&q=80',
        bg: '#E8F8EE',
    },
    {
        id: '2',
        title: 'New Arrivals',
        subtitle: 'Discover our freshest collection of exotic plants',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
        bg: '#FFF4E4',
    },
];

export default function HomeScreen({ navigation }) {
    const { currentUser, userData } = useAuth();
    const { getColumns, contentMaxWidth, width: screenWidth } = useResponsive();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeBanner, setActiveBanner] = useState(0);

    const displayName = userData?.name || currentUser?.displayName || 'User';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning 👋';
        if (hour < 18) return 'Good afternoon 👋';
        return 'Good evening 👋';
    };

    const numColumns = getColumns();
    const bannerWidth = Math.min(screenWidth, contentMaxWidth) - SPACING.lg * 2;

    const filtered = PLANTS.filter(p => {
        const matchCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });


    return (
        <SafeAreaView style={styles.container}>
            <LayoutContainer>
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()}</Text>
                            <Text style={styles.username}>{displayName}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                                <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Wishlist')}>
                                <Ionicons name="heart-outline" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                                <Ionicons name="cart-outline" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
                                <Image
                                    source={{ uri: userData?.avatar || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4CAF50&color=fff&size=100` }}
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Search Bar ── */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search plants..."
                                placeholderTextColor={COLORS.textLight}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Banner Carousel ── */}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.bannerScroll}
                        onMomentumScrollEnd={e => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
                            setActiveBanner(idx);
                        }}
                    >
                        {BANNERS.map((b) => (
                            <View key={b.id} style={[styles.banner, { backgroundColor: b.bg, width: bannerWidth }]}>
                                <View style={styles.bannerText}>
                                    <Text style={styles.bannerTitle}>{b.title}</Text>
                                    <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                                    <TouchableOpacity style={styles.shopNowBtn}>
                                        <Text style={styles.shopNowText}>Shop Now</Text>
                                    </TouchableOpacity>
                                </View>
                                <Image source={{ uri: b.image }} style={styles.bannerImage} resizeMode="cover" />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Banner Dots */}
                    <View style={styles.bannerDots}>
                        {BANNERS.map((_, i) => (
                            <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
                        ))}
                    </View>

                    {/* ── Categories ── */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── Most Popular ── */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Most Popular</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <FlatList
                        key={`grid-${numColumns}`}
                        data={filtered}
                        keyExtractor={item => item.id}
                        numColumns={numColumns}
                        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                        scrollEnabled={false}
                        contentContainerStyle={styles.gridContainer}
                        renderItem={({ item }) => (
                            <PlantCard
                                item={item}
                                style={numColumns > 1 ? { marginHorizontal: SPACING.xs } : { marginBottom: SPACING.md }}
                                onPress={(plant) => navigation.navigate('ProductDetail', { plant })}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="leaf-outline" size={60} color={COLORS.border} />
                                <Text style={styles.emptyText}>No plants found</Text>
                            </View>
                        }
                    />

                </ScrollView>
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.lg,
    },
    greeting: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    username: { ...TYPOGRAPHY.h3 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    iconBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarContainer: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primary },
    avatar: { width: '100%', height: '100%' },

    searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.sm },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md,
        height: 48, borderWidth: 1, borderColor: COLORS.border,
    },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, ...TYPOGRAPHY.bodySmall, color: COLORS.text },
    filterBtn: {
        width: 48, height: 48, backgroundColor: COLORS.primary,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },

    bannerScroll: { paddingLeft: SPACING.lg, marginBottom: SPACING.sm },
    banner: {
        borderRadius: 20, flexDirection: 'row', alignItems: 'center',
        padding: SPACING.lg, height: 140, marginRight: SPACING.md, overflow: 'hidden',
    },
    bannerText: { flex: 1 },
    bannerTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, fontSize: 18, lineHeight: 24, marginBottom: 6 },
    bannerSubtitle: { ...TYPOGRAPHY.bodySmall, marginBottom: SPACING.sm, lineHeight: 18 },
    shopNowBtn: {
        backgroundColor: COLORS.primary, borderRadius: 20,
        paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start',
    },
    shopNowText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontWeight: '600' },
    bannerImage: { width: 120, height: 120, borderRadius: 12 },
    bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: SPACING.md },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
    dotActive: { backgroundColor: COLORS.primary, width: 24 },

    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
    },
    sectionTitle: { ...TYPOGRAPHY.h3 },
    seeAll: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },

    categoriesScroll: { paddingLeft: SPACING.lg, marginBottom: SPACING.lg },
    catChip: {
        paddingVertical: 8, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.card, borderRadius: 20, marginRight: SPACING.sm,
        borderWidth: 1, borderColor: COLORS.border,
    },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, fontWeight: '600' },
    catTextActive: { color: COLORS.white },

    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },
    emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { ...TYPOGRAPHY.body, color: COLORS.textLight, marginTop: SPACING.md },
});
