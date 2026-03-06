import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function CustomerServiceChatScreen({ navigation }) {
    const { currentUser } = useAuth();
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

        // Initialize with welcome message if chat is empty
        return () => unsubscribe();
    }, [currentUser]);

    const sendMessage = async () => {
        if (!input.trim() || !currentUser) return;

        const text = input;
        setInput('');

        const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add user message to Firestore
        await addDoc(messagesRef, {
            text: text,
            sender: 'user',
            time: timeString,
            createdAt: serverTimestamp()
        });

        // Mock auto-reply written to Firestore
        setTimeout(async () => {
            const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await addDoc(messagesRef, {
                text: 'Thank you for your message. An agent will be with you shortly.',
                sender: 'agent',
                time: agentTime,
                createdAt: serverTimestamp()
            });
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }}
                        style={styles.agentAvatar}
                    />
                    <View>
                        <Text style={styles.agentName}>Customer Service</Text>
                        <Text style={styles.agentStatus}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="call-outline" size={24} color={COLORS.text} />
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
                    <View style={styles.messageContainer}>
                        <View style={[styles.bubble, styles.agentBubble]}>
                            <Text style={[styles.messageText, styles.agentText]}>
                                Hello! How can we help you today?
                            </Text>
                        </View>
                        <Text style={styles.messageTime}>Now</Text>
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
                            msg.sender === 'user' ? styles.userBubble : styles.agentBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : styles.agentText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                        <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { padding: 4 },
    agentAvatar: { width: 40, height: 40, borderRadius: 20 },
    agentName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    agentStatus: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    headerBtn: { padding: 8 },
    chatContent: { padding: SPACING.lg, paddingBottom: 20 },
    messageContainer: { marginBottom: SPACING.lg, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    agentMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: { padding: 16, borderRadius: 20 },
    userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    agentBubble: { backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
    messageText: { ...TYPOGRAPHY.bodySmall, lineHeight: 20 },
    userText: { color: COLORS.white },
    agentText: { color: COLORS.text },
    messageTime: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
        gap: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    attachBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
    input: {
        flex: 1, backgroundColor: COLORS.card, borderRadius: 22,
        paddingHorizontal: 16, paddingVertical: 10, ...TYPOGRAPHY.bodySmall,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
});
