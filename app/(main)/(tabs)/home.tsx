import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, TextInput, ScrollView
} from 'react-native';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../../../src/components/PlantCard';
import { PLANTS, CATEGORIES } from '../../../src/constants/data';
import LayoutContainer from '../../../src/components/LayoutContainer';
import { useResponsive } from '../../../src/utils/responsive';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    bg: string;
}

const BANNERS: Banner[] = [
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

export default function HomeScreen() {
    const { currentUser, userData } = useAuth();
    const { colors } = useTheme();
    const { getColumns, contentMaxWidth, width: screenWidth } = useResponsive();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeBanner, setActiveBanner] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const router = useRouter();

    const displayName = userData?.name || currentUser?.displayName || 'User';

    // Real-time cart count listener
    useEffect(() => {
        if (!currentUser) { setCartCount(0); return; }
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            const totalItems = snapshot.docs.reduce((sum, doc) => sum + ((doc.data() as any).qty || 1), 0);
            setCartCount(totalItems);
        }, () => setCartCount(0));
        return () => unsubscribe();
    }, [currentUser]);

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

    const handleProductPress = (plant: any) => {
        router.push({
            pathname: '/(main)/product-details',
            params: { id: plant.id }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.textLight }]}>{getGreeting()}</Text>
                            <Text style={[styles.username, { color: colors.text }]}>{displayName}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => router.push('/(main)/notification')}>
                                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => router.push('/(main)/my-favorites')}>
                                <Ionicons name="heart-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => router.push('/(main)/cart')}>
                                <Ionicons name="cart-outline" size={24} color={colors.text} />
                                {cartCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/(main)/(tabs)/profile')}>
                                <Image
                                    source={{ uri: userData?.avatar || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4CAF50&color=fff&size=100` }}
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.searchRow}>
                        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search plants..."
                                placeholderTextColor={colors.textLight}
                                value={search}
                                onChangeText={setSearch}
                                onSubmitEditing={() => search.trim() && router.push({ pathname: '/(main)/(tabs)/explore', params: { searchQuery: search } })}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterBtn} onPress={() => router.push({ pathname: '/(main)/(tabs)/explore', params: { openFilter: 'true' } })}>
                            <Ionicons name="options-outline" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

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
                                    <Text style={[styles.bannerTitle, { color: '#000' }]}>{b.title}</Text>
                                    <Text style={[styles.bannerSubtitle, { color: '#333' }]}>{b.subtitle}</Text>
                                    <TouchableOpacity style={styles.shopNowBtn}>
                                        <Text style={styles.shopNowText}>Shop Now</Text>
                                    </TouchableOpacity>
                                </View>
                                <Image source={{ uri: b.image }} style={styles.bannerImage} resizeMode="cover" />
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.bannerDots}>
                        {BANNERS.map((_, i) => (
                            <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[styles.aiBanner, { backgroundColor: COLORS.primaryLight + '20', borderColor: COLORS.primary }]}
                        onPress={() => router.push('/(main)/plant-doctor')}
                    >
                        <View style={styles.aiBannerText}>
                            <Text style={[styles.aiBannerTitle, { color: COLORS.primary }]}>🌿 AI Plant Doctor</Text>
                            <Text style={[styles.aiBannerSub, { color: colors.text }]}>Take a photo to diagnose sick plants</Text>
                        </View>
                        <View style={styles.aiBannerIcon}>
                            <Ionicons name="camera" size={24} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.aiBanner, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', marginTop: -8 }]}
                        onPress={() => router.push('/(main)/my-garden')}
                    >
                        <View style={styles.aiBannerText}>
                            <Text style={[styles.aiBannerTitle, { color: '#2E7D32' }]}>🏡 My Garden Tracker</Text>
                            <Text style={[styles.aiBannerSub, { color: colors.text }]}>Manage your collection and care tasks</Text>
                        </View>
                        <View style={[styles.aiBannerIcon, { backgroundColor: '#2E7D32' }]}>
                            <Ionicons name="leaf" size={24} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
                        <TouchableOpacity><Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catChip, { backgroundColor: colors.card, borderColor: colors.border }, activeCategory === cat.id && styles.catChipActive]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Text style={[styles.catText, { color: colors.textLight }, activeCategory === cat.id && styles.catTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Popular</Text>
                        <TouchableOpacity><Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text></TouchableOpacity>
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
                                onPress={() => handleProductPress(item)}
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
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.lg },
    greeting: { fontSize: 13, fontWeight: '400' },
    username: { fontSize: 20, fontWeight: '700' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff' },
    cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    avatarContainer: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primary },
    avatar: { width: '100%', height: '100%' },
    searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.sm },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: SPACING.md, height: 48, borderWidth: 1 },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, fontSize: 14 },
    filterBtn: { width: 48, height: 48, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    bannerScroll: { paddingLeft: SPACING.lg, marginBottom: SPACING.sm },
    banner: { borderRadius: 20, flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, height: 140, marginRight: SPACING.md, overflow: 'hidden' },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 6 },
    bannerSubtitle: { fontSize: 12, marginBottom: SPACING.sm, lineHeight: 18 },
    shopNowBtn: { backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start' },
    shopNowText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
    bannerImage: { width: 120, height: 120, borderRadius: 12 },
    bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: SPACING.md },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
    dotActive: { backgroundColor: COLORS.primary, width: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    seeAll: { fontSize: 14, fontWeight: '600' },
    categoriesScroll: { paddingLeft: SPACING.lg, marginBottom: SPACING.lg },
    catChip: { paddingVertical: 8, paddingHorizontal: SPACING.md, borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1 },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 14, fontWeight: '600' },
    catTextActive: { color: COLORS.white },
    gridContainer: { paddingHorizontal: SPACING.lg },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },
    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: 12 },
    aiBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, padding: SPACING.md, borderRadius: 16, borderWidth: 1 },
    aiBannerText: { flex: 1 },
    aiBannerTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    aiBannerSub: { fontSize: 13, opacity: 0.8 },
    aiBannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});
