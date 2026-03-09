import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CustomerServiceChatScreen({ navigation }) {
    const { currentUser } = useAuth();
    const { colors, isDark } = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef();

    useEffect(() => {
        if (!currentUser) return;

        const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
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
            // Add user message to Firestore
            await addDoc(messagesRef, {
                text: text,
                sender: 'user',
                time: timeString,
                createdAt: serverTimestamp()
            });

            // Mock auto-reply written to Firestore if it's the first message or specific trigger
            if (messages.length === 0) {
                setTimeout(async () => {
                    const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    await addDoc(messagesRef, {
                        text: 'Thank you for contacting Potea! Our team will get back to you shortly.',
                        sender: 'agent',
                        time: agentTime,
                        createdAt: serverTimestamp()
                    });
                }, 1000);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }}
                        style={styles.agentAvatar}
                    />
                    <View>
                        <Text style={[styles.agentName, { color: colors.text }]}>Customer Service</Text>
                        <Text style={styles.agentStatus}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="call-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.chatContent}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {loading && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                )}
                {!loading && messages.length === 0 && (
                    <View style={styles.welcomeContainer}>
                        <View style={[styles.bubble, styles.agentBubble, { backgroundColor: colors.card }]}>
                            <Text style={[styles.messageText, { color: colors.text }]}>
                                Hello! How can we help you today?
                            </Text>
                        </View>
                        <Text style={[styles.messageTime, { color: colors.textLight }]}>Now</Text>
                    </View>
                )}
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageContainer,
                            msg.sender === 'user' ? styles.userMessage : styles.agentMessage
                        ]}
                    >
                        <View style={[
                            styles.bubble,
                            msg.sender === 'user'
                                ? [styles.userBubble, { backgroundColor: COLORS.primary }]
                                : [styles.agentBubble, { backgroundColor: colors.card }]
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : { color: colors.text }
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                        <Text style={[styles.messageTime, { color: colors.textLight }]}>{msg.time}</Text>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputArea, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <TouchableOpacity style={styles.attachBtn}>
                            <Ionicons name="add" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textLight}
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: COLORS.primary }]}
                            onPress={sendMessage}
                            disabled={!input.trim()}
                        >
                            <Ionicons name="send" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { padding: 4 },
    agentAvatar: { width: 40, height: 40, borderRadius: 20 },
    agentName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    agentStatus: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    headerBtn: { padding: 8 },
    chatContent: { padding: SPACING.lg, paddingBottom: 20 },
    welcomeContainer: { marginBottom: SPACING.lg, maxWidth: '80%', alignSelf: 'flex-start' },
    messageContainer: { marginBottom: SPACING.lg, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    agentMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: { padding: 16, borderRadius: 20 },
    userBubble: { borderBottomRightRadius: 4 },
    agentBubble: { borderBottomLeftRadius: 4 },
    messageText: { ...TYPOGRAPHY.bodySmall, lineHeight: 20 },
    userText: { color: COLORS.white },
    messageTime: { fontSize: 10, marginTop: 4 },
    inputArea: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        borderTopWidth: 1,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 8,
        borderRadius: 28, gap: 8,
    },
    attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    input: {
        flex: 1, paddingHorizontal: 12, paddingVertical: 8,
        ...TYPOGRAPHY.bodySmall, maxHeight: 100,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
});
