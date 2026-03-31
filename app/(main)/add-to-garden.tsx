import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { gardenService } from '../../src/services/gardenService';
import { db } from '../../src/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Plant } from '../../src/types';
import Button from '../../src/components/Button';

const LOCATIONS = ['Living Room', 'Bedroom', 'Kitchen', 'Balcony', 'Office', 'Garden', 'Other'];

export default function AddToGardenScreen() {
    const { colors, isDark } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [nickname, setNickname] = useState('');
    const [location, setLocation] = useState('Living Room');
    const [wateringDays, setWateringDays] = useState('7');
    const [fertilizingDays, setFertilizingDays] = useState('30');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllPlants = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'plants'));
                const plants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant));
                setAllPlants(plants);
            } catch (error) {
                console.error("Fetch plants error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPlants();
    }, []);

    const filteredPlants = allPlants.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async () => {
        if (!selectedPlant && !nickname) {
            Alert.alert("Error", "Please select a plant or enter a nickname.");
            return;
        }

        if (!currentUser) return;

        setSaving(true);
        try {
            await gardenService.addUserPlant({
                userId: currentUser.uid,
                plantId: selectedPlant?.id,
                nickname: nickname || selectedPlant?.name || 'My Plant',
                image: selectedPlant?.image || 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=400',
                location: location,
                healthStatus: 'healthy',
                careSchedule: {
                    watering: parseInt(wateringDays),
                    fertilizing: parseInt(fertilizingDays),
                    repotting: 365, // Default to once a year
                },
                lastCare: {}
            });
            Alert.alert("Success", "Plant added to your garden!", [
                { text: "OK", onPress: () => router.replace('/(main)/my-garden') }
            ]);
        } catch (error) {
            console.error("Add plant error", error);
            Alert.alert("Error", "Failed to add plant.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Add New Plant</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* STEP 1: SELECT PLANT */}
                <Text style={[styles.sectionLabel, { color: colors.text }]}>1. Select a Plant Type</Text>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.textLight} />
                    <TextInput 
                        placeholder="Search plants..." 
                        placeholderTextColor={colors.textLight}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantSelectScroll}>
                        {filteredPlants.map(plant => (
                            <TouchableOpacity 
                                key={plant.id} 
                                style={[
                                    styles.plantOption, 
                                    { backgroundColor: colors.card },
                                    selectedPlant?.id === plant.id && { borderColor: COLORS.primary, borderWidth: 2 }
                                ]}
                                onPress={() => {
                                    setSelectedPlant(plant);
                                    if (!nickname) setNickname(plant.name);
                                    if (plant.care) {
                                        // Extract numeric value from care strings if possible, otherwise use defaults
                                        const waterMatch = plant.care.water?.match(/\d+/);
                                        if (waterMatch) setWateringDays(waterMatch[0]);
                                    }
                                }}
                            >
                                <Image source={{ uri: plant.image }} style={styles.optionImage} />
                                <Text style={[styles.optionName, { color: colors.text }]} numberOfLines={1}>{plant.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* STEP 2: NICKNAME & LOCATION */}
                <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 24 }]}>2. Personalize Your Plant</Text>
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Nickname</Text>
                    <TextInput 
                        style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g. Sunny the Sunflower"
                        placeholderTextColor={colors.textLight}
                        value={nickname}
                        onChangeText={setNickname}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationScroll}>
                        {LOCATIONS.map(loc => (
                            <TouchableOpacity 
                                key={loc} 
                                style={[
                                    styles.locationTag, 
                                    { backgroundColor: location === loc ? COLORS.primary : colors.card }
                                ]}
                                onPress={() => setLocation(loc)}
                            >
                                <Text style={[styles.locationTagText, { color: location === loc ? COLORS.white : colors.text }]}>{loc}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* STEP 3: CARE SCHEDULE */}
                <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 24 }]}>3. Set Care Schedule</Text>
                
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Watering (every X days)</Text>
                        <TextInput 
                            style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                            keyboardType="numeric"
                            value={wateringDays}
                            onChangeText={setWateringDays}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Fertilizing (every X days)</Text>
                        <TextInput 
                            style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                            keyboardType="numeric"
                            value={fertilizingDays}
                            onChangeText={setFertilizingDays}
                        />
                    </View>
                </View>

                <Button 
                    title={saving ? "Adding..." : "Add to Garden"} 
                    onPress={handleSave}
                    disabled={saving}
                    style={styles.saveBtn}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg, paddingBottom: 40 },

    sectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
    
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 16, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
    
    plantSelectScroll: { marginBottom: 12 },
    plantOption: { width: 100, padding: 8, borderRadius: 16, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
    optionImage: { width: '100%', height: 84, borderRadius: 12, marginBottom: 8 },
    optionName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    textInput: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, borderWidth: 1 },
    
    locationScroll: { gap: 8, paddingBottom: 4 },
    locationTag: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    locationTagText: { fontSize: 13, fontWeight: '600' },

    row: { flexDirection: 'row', justifyContent: 'space-between' },
    saveBtn: { marginTop: 24, height: 58 },
});
