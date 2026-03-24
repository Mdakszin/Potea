import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { aiService, PlantDiagnosis } from '../../src/services/aiService';

// Mock care products to suggest alongside the diagnosis
const CARE_PRODUCTS = [
    { id: 'c1', name: 'Premium Neem Oil', price: 12.99, image: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?w=400', tag: 'Neem Oil' },
    { id: 'c2', name: 'Organic Liquid Fertilizer', price: 18.50, image: 'https://images.unsplash.com/photo-1595804562092-d38df81c2f90?w=400', tag: 'Fertilizer' },
    { id: 'c3', name: 'Ceramic Self-Watering Pot', price: 24.00, image: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=400', tag: 'Pot' },
    { id: 'c4', name: 'Glass Plant Mister', price: 14.99, image: 'https://images.unsplash.com/photo-1621506289937-a8e4fc05e978?w=400', tag: 'Spray Bottle' },
    { id: 'c5', name: 'Aroid Potting Soil Mix', price: 16.00, image: 'https://images.unsplash.com/photo-1557096055-667468d2da88?w=400', tag: 'Premium Soil' },
];

export default function PlantDoctorScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);

    const pickImage = async (useCamera: boolean = false) => {
        try {
            let result;
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 5],
                quality: 0.8,
            };

            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Please grant camera access to take a photo.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Please grant gallery access to pick a photo.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                setDiagnosis(null); // Reset previous diagnosis
                
                // Compress and convert to base64
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { width: 800 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, { encoding: 'base64' });
                setBase64Image(base64);
            }
        } catch (error) {
            console.error("Image pick error", error);
            Alert.alert('Error', 'Failed to select image.');
        }
    };

    const analyzeImage = async () => {
        if (!base64Image) return;
        setLoading(true);
        try {
            const result = await aiService.analyzePlantImage(base64Image);
            setDiagnosis(result);
        } catch (error) {
            Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Find recommended products by fuzzy matching tags
    const getRecommendedProducts = () => {
        if (!diagnosis) return [];
        return CARE_PRODUCTS.filter(p => 
            diagnosis.recommendedProductTags.some(tag => 
                tag.toLowerCase().includes(p.tag.toLowerCase()) || p.tag.toLowerCase().includes(tag.toLowerCase())
            )
        );
    };

    const recommendedProducts = getRecommendedProducts();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>AI Plant Doctor</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={[styles.heroCard, { backgroundColor: isDark ? colors.card : COLORS.primaryLight + '30' }]}>
                    <View style={styles.heroTextContainer}>
                        <Text style={[styles.heroTitle, { color: COLORS.primary }]}>Is your plant feeling sick?</Text>
                        <Text style={[styles.heroSubtitle, { color: colors.text }]}>Take a photo and our AI will diagnose the issue and provide expert care advice instantly.</Text>
                    </View>
                    <Ionicons name="scan-circle" size={80} color={COLORS.primary} style={styles.heroIcon} />
                </View>

                {/* IMAGE PICKER AREA */}
                {!imageUri ? (
                    <View style={[styles.uploadContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <Ionicons name="image-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                        <Text style={[styles.uploadTitle, { color: colors.text }]}>Upload a photo of your plant</Text>
                        <Text style={[styles.uploadSub, { color: colors.textLight }]}>Make sure the leaves or affected areas are clearly visible.</Text>
                        
                        <View style={styles.uploadActions}>
                            <Button 
                                title="Take Photo" 
                                icon={<Ionicons name="camera" size={20} color={COLORS.white} />}
                                onPress={() => pickImage(true)} 
                                style={styles.actionBtn} 
                            />
                            <Button 
                                title="Gallery" 
                                variant="outline"
                                icon={<Ionicons name="images" size={20} color={COLORS.primary} />}
                                onPress={() => pickImage(false)} 
                                style={styles.actionBtn} 
                            />
                        </View>
                    </View>
                ) : (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        {!diagnosis && !loading && (
                            <TouchableOpacity style={styles.retakeBtn} onPress={() => pickImage(false)}>
                                <Ionicons name="refresh" size={20} color={COLORS.white} />
                                <Text style={styles.retakeText}>Change Photo</Text>
                            </TouchableOpacity>
                        )}
                        {loading && (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color={COLORS.white} />
                                <Text style={styles.analyzingText}>AI is analyzing your plant...</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ACTION BUTTON */}
                {imageUri && !diagnosis && !loading && (
                    <Button 
                        title="Analyze Plant Health" 
                        onPress={analyzeImage}
                        icon={<Ionicons name="sparkles" size={20} color={COLORS.white} />}
                        style={styles.analyzeSubmitBtn}
                    />
                )}

                {/* DIAGNOSIS RESULTS */}
                {diagnosis && (
                    <View style={styles.resultsContainer}>
                        <View style={[styles.diagnosisCard, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight + '20', borderColor: COLORS.primary }]}>
                            <View style={styles.diagHeader}>
                                <Ionicons name="leaf" size={24} color={COLORS.primary} />
                                <Text style={[styles.diagTitle, { color: COLORS.primary }]}>Diagnosis</Text>
                                <View style={styles.confidenceBadge}>
                                    <Text style={styles.confText}>{(diagnosis.confidence * 100).toFixed(0)}% Match</Text>
                                </View>
                            </View>
                            <Text style={[styles.diagText, { color: colors.text }]}>{diagnosis.diagnosis}</Text>
                            
                            <View style={[styles.divider, { backgroundColor: COLORS.primary + '30' }]} />
                            
                            <View style={styles.diagHeader}>
                                <Ionicons name="medical" size={24} color={COLORS.primary} />
                                <Text style={[styles.diagTitle, { color: COLORS.primary }]}>Care Advice</Text>
                            </View>
                            <Text style={[styles.diagText, { color: colors.text }]}>{diagnosis.advice}</Text>
                        </View>

                        {/* PRODUCT RECOMMENDATIONS */}
                        {recommendedProducts.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended For Your Plant</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                                    {recommendedProducts.map(product => (
                                        <View key={product.id} style={[styles.prodCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                            <Image source={{ uri: product.image }} style={styles.prodImage} />
                                            <View style={styles.prodInfo}>
                                                <Text style={[styles.prodName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
                                                <Text style={[styles.prodPrice, { color: COLORS.primary }]}>${product.price.toFixed(2)}</Text>
                                                <TouchableOpacity 
                                                    style={styles.addBtn}
                                                    onPress={() => {
                                                        Alert.alert("Added to Cart", `${product.name} was added to your cart.`);
                                                    }}
                                                >
                                                    <Text style={styles.addBtnText}>Add to Cart</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
    
    heroCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 24 },
    heroTextContainer: { flex: 1, paddingRight: 16 },
    heroTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    heroSubtitle: { fontSize: 13, lineHeight: 20 },
    heroIcon: { opacity: 0.8 },

    uploadContainer: { alignItems: 'center', padding: 32, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed' },
    uploadTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    uploadSub: { fontSize: 13, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    uploadActions: { flexDirection: 'row', gap: 12, width: '100%' },
    actionBtn: { flex: 1, height: 50 },

    imagePreviewContainer: { position: 'relative', borderRadius: 24, overflow: 'hidden', ...SHADOWS.medium, marginBottom: 24 },
    previewImage: { width: '100%', height: 400, borderRadius: 24 },
    retakeBtn: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    retakeText: { color: COLORS.white, fontWeight: '600' },
    
    analyzingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(36, 107, 253, 0.85)', justifyContent: 'center', alignItems: 'center', borderRadius: 24 },
    analyzingText: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginTop: 16 },
    
    analyzeSubmitBtn: { marginBottom: 24 },

    resultsContainer: { marginTop: 8 },
    diagnosisCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
    diagHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    diagTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
    confidenceBadge: { backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    confText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
    diagText: { fontSize: 15, lineHeight: 24, opacity: 0.9 },
    divider: { height: 1, marginVertical: 20 },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    productsScroll: { gap: 16, paddingBottom: 16 },
    prodCard: { width: 160, borderRadius: 20, padding: 12, borderWidth: 1 },
    prodImage: { width: '100%', height: 120, borderRadius: 12, marginBottom: 12 },
    prodInfo: { flex: 1, justifyContent: 'space-between' },
    prodName: { fontSize: 13, fontWeight: '600', marginBottom: 4, minHeight: 40 },
    prodPrice: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
    addBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
    addBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});
