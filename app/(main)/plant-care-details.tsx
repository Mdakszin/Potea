import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gardenService } from '../../src/services/gardenService';
import { UserPlant, CareLog, GrowthUpdate } from '../../src/types';
import Button from '../../src/components/Button';
import * as ImagePicker from 'expo-image-picker';

export default function PlantCareDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const [plant, setPlant] = useState<UserPlant | null>(null);
    const [logs, setLogs] = useState<CareLog[]>([]);
    const [updates, setUpdates] = useState<GrowthUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const userPlants = await gardenService.getUserPlants(""); // Needs filtering in real app context or getById
            // Since getUserPlants returns all, we find the one we need
            // In a real app, gardenService would have a getPlantById
            const found = userPlants.find(p => p.id === id);
            if (found) {
                setPlant(found);
                const [careLogs, growthUpdates] = await Promise.all([
                    gardenService.getCareLogs(found.id),
                    gardenService.getGrowthUpdates(found.id)
                ]);
                setLogs(careLogs);
                setUpdates(growthUpdates);
            }
        } catch (error) {
            console.error("Fetch details error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCareAction = async (type: CareLog['type']) => {
        if (!plant) return;
        setActionLoading(true);
        try {
            await gardenService.logCareAction({
                userPlantId: plant.id,
                type: type,
                notes: `Quick action from details screen`
            });
            Alert.alert("Success", `Marked as ${type}!`);
            fetchData(); // Refresh data
        } catch (error) {
            Alert.alert("Error", "Failed to log care action.");
        } finally {
            setActionLoading(false);
        }
    };

    const addPhoto = async () => {
        if (!plant) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'] as any,
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setActionLoading(true);
            try {
                await gardenService.addGrowthUpdate({
                    userPlantId: plant.id,
                    image: result.assets[0].uri,
                    notes: "Added from gallery"
                });
                fetchData();
            } catch (error) {
                Alert.alert("Error", "Failed to add growth photo.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (loading) return (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    if (!plant) return (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.text }}>Plant not found.</Text>
        </View>
    );

    const getDaysRemaining = (type: 'watering' | 'fertilizing') => {
        const lastDate = plant.lastCare[type]?.toDate() || plant.dateAdded.toDate();
        const schedule = plant.careSchedule[type];
        const nextDate = new Date(lastDate.getTime() + schedule * 24 * 60 * 60 * 1000);
        const diff = nextDate.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const waterDays = getDaysRemaining('watering');
    const fertDays = getDaysRemaining('fertilizing');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{plant.nickname}</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Image source={{ uri: plant.image }} style={styles.mainImage} />
                    <View style={[styles.healthPill, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
                        <Text style={styles.healthPillText}>{plant.healthStatus.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="location" size={20} color={COLORS.primary} />
                            <Text style={[styles.metaText, { color: colors.textLight }]}>{plant.location}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar" size={20} color={COLORS.primary} />
                            <Text style={[styles.metaText, { color: colors.textLight }]}>Joined Garden: {plant.dateAdded.toDate().toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* CARE STATUS CARDS */}
                    <View style={styles.careCardsRow}>
                        <View style={[styles.careCard, { backgroundColor: colors.card }]}>
                            <Ionicons name="water" size={32} color={COLORS.primary} />
                            <Text style={[styles.careCardTitle, { color: colors.text }]}>Watering</Text>
                            <Text style={[styles.careCardStatus, { color: waterDays <= 0 ? '#F44336' : COLORS.primary }]}>
                                {waterDays <= 0 ? 'Urgent' : `In ${waterDays} days`}
                            </Text>
                            <TouchableOpacity 
                                style={[styles.careActionBtn, { backgroundColor: COLORS.primary }]}
                                onPress={() => handleCareAction('watering')}
                                disabled={actionLoading}
                            >
                                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.careCard, { backgroundColor: colors.card }]}>
                            <Ionicons name="leaf" size={32} color={COLORS.primary} />
                            <Text style={[styles.careCardTitle, { color: colors.text }]}>Fertilizing</Text>
                            <Text style={[styles.careCardStatus, { color: COLORS.primary }]}>
                                In {fertDays} days
                            </Text>
                            <TouchableOpacity 
                                style={[styles.careActionBtn, { backgroundColor: COLORS.primary }]}
                                onPress={() => handleCareAction('fertilizing')}
                                disabled={actionLoading}
                            >
                                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* GROWTH GALLERY */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Progress</Text>
                        <TouchableOpacity onPress={addPhoto}>
                            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    {updates.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>No progress photos yet.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                            {updates.map(upd => (
                                <View key={upd.id} style={styles.galleryItem}>
                                    <Image source={{ uri: upd.image }} style={styles.galleryImage} />
                                    <Text style={[styles.galleryDate, { color: colors.textLight }]}>{upd.date.toDate().toLocaleDateString()}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* CARE LOGS */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Care History</Text>
                    {logs.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>No actions logged yet.</Text>
                    ) : (
                        logs.map(log => (
                            <View key={log.id} style={[styles.logItem, { borderColor: colors.border }]}>
                                <View style={[styles.logIcon, { backgroundColor: COLORS.primary + '20' }]}>
                                    <Ionicons name={log.type === 'watering' ? 'water' : 'leaf'} size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.logContent}>
                                    <Text style={[styles.logType, { color: colors.text }]}>{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</Text>
                                    <Text style={[styles.logDate, { color: colors.textLight }]}>{log.date.toDate().toLocaleString()}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scrollContent: { paddingBottom: 60 },

    heroSection: { position: 'relative', height: 350, width: '100%' },
    mainImage: { width: '100%', height: '100%' },
    healthPill: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
    healthPillText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },

    infoSection: { padding: SPACING.lg },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { fontSize: 14, fontWeight: '600' },

    careCardsRow: { flexDirection: 'row', gap: 16 },
    careCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', ...SHADOWS.small },
    careCardTitle: { fontSize: 14, fontWeight: '600', marginTop: 12 },
    careCardStatus: { fontSize: 18, fontWeight: '800', marginVertical: 8 },
    careActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

    section: { paddingHorizontal: SPACING.lg, marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    emptyText: { fontSize: 14, opacity: 0.6 },

    galleryScroll: { gap: 12 },
    galleryItem: { marginRight: 12, alignItems: 'center' },
    galleryImage: { width: 120, height: 160, borderRadius: 16, marginBottom: 8 },
    galleryDate: { fontSize: 12, fontWeight: '600' },

    logItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
    logIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    logContent: { flex: 1 },
    logType: { fontSize: 15, fontWeight: '700' },
    logDate: { fontSize: 13, marginTop: 2 },
});
