import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { gardenService } from '../../src/services/gardenService';
import { UserPlant } from '../../src/types';
import Button from '../../src/components/Button';

export default function MyGardenScreen() {
    const { colors, isDark } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [plants, setPlants] = useState<UserPlant[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        if (!currentUser) return;
        try {
            const userPlants = await gardenService.getUserPlants(currentUser.uid);
            setPlants(userPlants);
        } catch (error) {
            console.error("Fetch garden error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getCareTasks = () => {
        // Simple logic to find plants that need watering based on lastCare and schedule
        const now = new Date().getTime();
        return plants.filter(plant => {
            if (!plant.lastCare.watering) return true;
            const lastWatered = plant.lastCare.watering.toDate().getTime();
            const daysSinceWatered = (now - lastWatered) / (1000 * 60 * 60 * 24);
            return daysSinceWatered >= plant.careSchedule.watering;
        });
    };

    const tasksNeeded = getCareTasks();

    const renderPlantCard = ({ item }: { item: UserPlant }) => (
        <TouchableOpacity 
            style={[styles.plantCard, { backgroundColor: colors.card }]}
            onPress={() => router.push({ pathname: '/(main)/plant-care-details', params: { id: item.id } })}
        >
            <Image source={{ uri: item.image }} style={styles.plantImage} />
            <View style={styles.plantInfo}>
                <Text style={[styles.nickname, { color: colors.text }]} numberOfLines={1}>{item.nickname}</Text>
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={12} color={COLORS.primary} />
                    <Text style={[styles.locationText, { color: colors.textLight }]}>{item.location}</Text>
                </View>
                <View style={[styles.healthBadge, { backgroundColor: getHealthColor(item.healthStatus) + '20' }]}>
                    <Text style={[styles.healthText, { color: getHealthColor(item.healthStatus) }]}>{item.healthStatus.toUpperCase()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return '#4CAF50';
            case 'needs-attention': return '#FF9800';
            case 'sick': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>My Garden</Text>
                <TouchableOpacity onPress={fetchPlants} style={styles.actionBtn}>
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <ActivityIndicator animating={refreshing} color={COLORS.primary} />
                }
            >
                {/* SUMMARY CARD */}
                <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
                    <View style={styles.summaryText}>
                        <Text style={styles.summaryTitle}>Garden Status</Text>
                        <Text style={styles.summarySubtitle}>
                            {tasksNeeded.length > 0 
                                ? `${tasksNeeded.length} plants need your attention today!` 
                                : "Your plants are doing great today!"}
                        </Text>
                    </View>
                    <Ionicons name="leaf" size={60} color="rgba(255,255,255,0.3)" />
                </View>

                {/* TODAY'S TASKS */}
                {tasksNeeded.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Care Tasks</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.taskScroll}>
                            {tasksNeeded.map(plant => (
                                <TouchableOpacity 
                                    key={plant.id} 
                                    style={[styles.taskCard, { backgroundColor: colors.card, borderColor: COLORS.primary }]}
                                    onPress={() => router.push({ pathname: '/(main)/plant-care-details', params: { id: plant.id } })}
                                >
                                    <Ionicons name="water" size={28} color={COLORS.primary} />
                                    <Text style={[styles.taskLabel, { color: colors.text }]} numberOfLines={1}>{plant.nickname}</Text>
                                    <Text style={styles.taskAction}>Needs Water</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* MY PLANTS GRID */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Plants ({plants.length})</Text>
                        <TouchableOpacity onPress={fetchPlants}>
                            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : plants.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="flower-outline" size={80} color={colors.textLight} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>Your garden is empty.</Text>
                            <Button 
                                title="Add Your First Plant" 
                                onPress={() => router.push('/(main)/add-to-garden')}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    ) : (
                        <View style={styles.plantsGrid}>
                            {plants.map(p => (
                                <View key={p.id} style={styles.gridItem}>
                                    {renderPlantCard({ item: p })}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push('/(main)/add-to-garden')}
            >
                <Ionicons name="add" size={32} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg, paddingBottom: 100 },

    summaryCard: { padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
    summaryText: { flex: 1 },
    summaryTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800', marginBottom: 4 },
    summarySubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20 },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    
    taskScroll: { gap: 12, paddingBottom: 4 },
    taskCard: { width: 130, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, ...SHADOWS.small },
    taskLabel: { fontSize: 14, fontWeight: '700', marginTop: 12 },
    taskAction: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },

    plantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    gridItem: { width: '47%' },
    plantCard: { borderRadius: 20, padding: 12, ...SHADOWS.small },
    plantImage: { width: '100%', height: 140, borderRadius: 16, marginBottom: 12 },
    plantInfo: { gap: 4 },
    nickname: { fontSize: 15, fontWeight: '700' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 12 },
    healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
    healthText: { fontSize: 10, fontWeight: '800' },

    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 16, marginTop: 16 },

    fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
});
