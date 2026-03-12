import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function CustomerServiceChatScreen() {
    const { currentUser } = useAuth();
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef();

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'chats', currentUser.uid, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const sendMessage = async () => {
        if (!input.trim() || !currentUser) return;
        const text = input;
        setInput('');
        const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
            await addDoc(messagesRef, { text, sender: 'user', time: timeString, createdAt: serverTimestamp() });
            if (messages.length === 0) {
                setTimeout(async () => {
                    const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    await addDoc(messagesRef, { text: 'Thank you for contacting Potea! Our team will get back to you shortly.', sender: 'agent', time: agentTime, createdAt: serverTimestamp() });
                }, 1000);
            }
        } catch (error) { console.error("Error sending message:", error); }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }} style={styles.agentAvatar} />
                    <View><Text style={[styles.agentName, { color: colors.text }]}>Customer Service</Text><Text style={styles.agentStatus}>Online</Text></View>
                </View>
                <TouchableOpacity><Ionicons name="call-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.chatContent} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} /> : messages.map((m, i) => (
                    <View key={m.id || i} style={[styles.messageWrapper, m.sender === 'user' ? styles.userWrapper : styles.agentWrapper]}>
                        <View style={[styles.messageBubble, m.sender === 'user' ? styles.userBubble : [styles.agentBubble, { backgroundColor: colors.card }]]}>
                            <Text style={[styles.messageText, { color: m.sender === 'user' ? COLORS.white : colors.text }]}>{m.text}</Text>
                        </View>
                        <Text style={[styles.messageTime, { color: colors.textLight }]}>{m.time}</Text>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                        <TextInput style={[styles.input, { color: colors.text }]} placeholder="Type a message..." placeholderTextColor={colors.textLight} value={input} onChangeText={setInput} multiline />
                        <TouchableOpacity onPress={sendMessage} disabled={!input.trim()}><Ionicons name="send" size={24} color={input.trim() ? COLORS.primary : colors.textLight} /></TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    agentAvatar: { width: 44, height: 44, borderRadius: 22 },
    agentName: { fontSize: 18, fontWeight: '700' },
    agentStatus: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    chatContent: { padding: SPACING.lg },
    messageWrapper: { marginBottom: 16, maxWidth: '80%' },
    userWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    agentWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    messageBubble: { padding: 12, borderRadius: 20 },
    userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    agentBubble: { borderBottomLeftRadius: 4 },
    messageText: { fontSize: 14, lineHeight: 20 },
    messageTime: { fontSize: 10, marginTop: 4 },
    inputContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderTopWidth: 1 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
    input: { flex: 1, maxHeight: 100, fontSize: 14, paddingRight: 10 },
});
