import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../../src/constants/theme';
import Button from '../../src/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ARPreviewScreen() {
    const { imageUri } = useLocalSearchParams();
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();

    // -- Gesture state --
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    
    // Using refs to keep track of current values during gestures
    const panOffset = useRef({ x: 0, y: 0 });
    const scaleRef = useRef(1);

    pan.addListener((value) => {
        panOffset.current = value;
    });

    const initialDistanceRef = useRef(0);
    const initialScaleRef = useRef(1);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;
                if (touches.length === 2) {
                    // Two fingers: init pinch
                    const dx = touches[0].pageX - touches[1].pageX;
                    const dy = touches[0].pageY - touches[1].pageY;
                    initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
                    initialScaleRef.current = scaleRef.current;
                } else if (touches.length === 1) {
                    // Single finger: init drag
                    pan.setOffset({
                        x: panOffset.current.x,
                        y: panOffset.current.y
                    });
                    pan.setValue({ x: 0, y: 0 });
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;
                if (touches.length === 2) {
                    // Pinch to zoom
                    const dx = touches[0].pageX - touches[1].pageX;
                    const dy = touches[0].pageY - touches[1].pageY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const initialDist = initialDistanceRef.current || distance;
                    const scaleFactor = distance / initialDist;
                    
                    let newScale = (initialScaleRef.current || 1) * scaleFactor;
                    newScale = Math.max(0.3, Math.min(newScale, 5)); // clamp scale between 0.3x and 5x
                    
                    scale.setValue(newScale);
                    scaleRef.current = newScale;
                } else if (touches.length === 1 && gestureState.numberActiveTouches === 1) {
                    // Drag
                    pan.x.setValue(gestureState.dx);
                    pan.y.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
            }
        })
    ).current;

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>We need your permission to show the camera for the AR View.</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.textLight }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={StyleSheet.absoluteFillObject} facing="back">
                
                {/* Header Overlay */}
                <SafeAreaView style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerPill}>
                        <Ionicons name="scan" size={16} color={COLORS.white} />
                        <Text style={styles.headerText}>Point at a flat surface</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </SafeAreaView>

                {/* Draggable/Scalable Plant Image */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.arItemContainer,
                        {
                            transform: [
                                { translateX: pan.x },
                                { translateY: pan.y },
                                { scale: scale }
                            ]
                        }
                    ]}
                >
                    <Animated.Image 
                        source={{ uri: imageUri as string }} 
                        style={styles.arPlantImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Footer Controls */}
                <SafeAreaView style={styles.footer} edges={['bottom']}>
                    <TouchableOpacity 
                        style={styles.captureBtn} 
                        onPress={() => Alert.alert('Captured!', 'This picture has been saved to your gallery.')}
                    >
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    <Text style={styles.helperText}>Pinch to resize • Drag to move</Text>
                </SafeAreaView>

            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
    permissionTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    permissionText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    header: { position: 'absolute', top: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 10, zIndex: 10 },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
    headerPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, borderRadius: 20, gap: 8, height: 40 },
    headerText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
    arItemContainer: { position: 'absolute', top: SCREEN_HEIGHT / 2 - 150, left: SCREEN_WIDTH / 2 - 150, width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
    arPlantImage: { width: '100%', height: '100%' },
    footer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', paddingBottom: 40 },
    captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.white },
    helperText: { color: COLORS.white, fontSize: 13, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});
