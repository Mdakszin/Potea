import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { Ionicons } from '@expo/vector-icons';

export default function FillProfileScreen({ navigation }) {
    const [fullName, setFullName] = useState('Andrew Ainsley');
    const [nickname, setNickname] = useState('Andrew');
    const [dob, setDob] = useState('12/27/1995');
    const [email, setEmail] = useState('andrew_ainsley@yourdomain.com');
    const [phone, setPhone] = useState('+1 111 467 378 399');
    const [gender, setGender] = useState('Male');

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fill Your Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarContainer}>
                        {/* Normally we'd use Image, using a colored View as placeholder if empty */}
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }}
                            style={styles.avatarImage}
                        />

                        <TouchableOpacity style={styles.editIconContainer}>
                            <Ionicons name="pencil" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <TextField
                            placeholder="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            style={styles.input}
                        />

                        <TextField
                            placeholder="Nickname"
                            value={nickname}
                            onChangeText={setNickname}
                            style={styles.input}
                        />

                        <TextField
                            placeholder="Date of Birth"
                            value={dob}
                            onChangeText={setDob}
                            icon="calendar-outline"
                            // In a real app we'd use a DatePicker component here
                            style={styles.input}
                        />

                        <TextField
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            icon="mail-outline"
                            keyboardType="email-address"
                            style={styles.input}
                        />

                        <TextField
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            // For the flag we'd ideally use a custom prefix component
                            // Putting phone as icon for now
                            icon="call-outline"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        <TextField
                            placeholder="Gender"
                            value={gender}
                            onChangeText={setGender}
                            icon="chevron-down-outline" // Right side icon usually, putting it left for now
                            style={styles.input}
                        />
                    </View>

                    <Button
                        title="Continue"
                        onPress={() => navigation.navigate('CreatePin')}
                        style={styles.continueButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    backButton: {
        paddingRight: SPACING.md,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
        position: 'relative',
        alignSelf: 'center',
    },
    avatarImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 10, // slightly squarish
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    formContainer: {
        width: '100%',
        flex: 1,
    },
    input: {
        marginBottom: SPACING.lg,
    },
    continueButton: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    }
});
