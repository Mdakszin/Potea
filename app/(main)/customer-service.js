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
import { aiService } from '../../src/services/aiService';

export default function CustomerServiceChatScreen() {
    const { currentUser } = useAuth();
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
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

    const sendMessage = async (customText = null) => {
        const textToSubmit = customText || input;
        if (!textToSubmit.trim() || !currentUser) return;
        
        if (!customText) setInput('');
        
        const messagesRef = collection(db, 'chats', currentUser.uid, 'messages');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
            // Add user message
            await addDoc(messagesRef, { 
                text: textToSubmit, 
                sender: 'user', 
                time: timeString, 
                createdAt: serverTimestamp() 
            });

            // Trigger AI Response
            setIsTyping(true);
            const aiResponse = await aiService.generateResponse(textToSubmit);
            setIsTyping(false);

            const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await addDoc(messagesRef, { 
                text: aiResponse, 
                sender: 'agent', 
                time: agentTime, 
                createdAt: serverTimestamp() 
            });
        } catch (error) { 
            console.error("Error sending message:", error); 
            setIsTyping(false);
        }
    };

    const handleQuickReply = (reply) => {
        sendMessage(reply);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }} style={styles.agentAvatar} />
                    <View>
                        <Text style={[styles.agentName, { color: colors.text }]}>Pote AI Assistant</Text>
                        <Text style={styles.agentStatus}>{isTyping ? 'Typing...' : 'Online'}</Text>
                    </View>
                </View>
                <TouchableOpacity><Ionicons name="call-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.chatContent} 
                ref={scrollViewRef} 
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {loading ? (
                    <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                ) : (
                    <>
                        {messages.length === 0 && (
                            <View style={styles.welcomeBox}>
                                <Ionicons name="leaf" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to Potea Support!</Text>
                                <Text style={[styles.welcomeDesc, { color: colors.textLight }]}>I'm Pote, and I can help you with plant care, orders, or returns. Ask me anything!</Text>
                            </View>
                        )}
                        {messages.map((m, i) => (
                            <View key={m.id || i} style={[styles.messageWrapper, m.sender === 'user' ? styles.userWrapper : styles.agentWrapper]}>
                                <View style={[styles.messageBubble, m.sender === 'user' ? styles.userBubble : [styles.agentBubble, { backgroundColor: colors.card }]]}>
                                    <Text style={[styles.messageText, { color: m.sender === 'user' ? COLORS.white : colors.text }]}>{m.text}</Text>
                                </View>
                                <Text style={[styles.messageTime, { color: colors.textLight }]}>{m.time}</Text>
                            </View>
                        ))}
                        {isTyping && (
                            <View style={[styles.messageWrapper, styles.agentWrapper]}>
                                <View style={[styles.messageBubble, styles.agentBubble, { backgroundColor: colors.card, paddingVertical: 16, paddingHorizontal: 20 }]}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <View style={styles.footerContainer}>
                {messages.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplyScroll}>
                        {aiService.getQuickReplies().map((reply, idx) => (
                            <TouchableOpacity key={idx} style={[styles.quickReplyBtn, { borderColor: colors.border }]} onPress={() => handleQuickReply(reply)}>
                                <Text style={[styles.quickReplyText, { color: COLORS.primary }]}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                            <TextInput 
                                style={[styles.input, { color: colors.text }]} 
                                placeholder="Type a message..." 
                                placeholderTextColor={colors.textLight} 
                                value={input} 
                                onChangeText={setInput} 
                                multiline 
                            />
                            <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || isTyping}>
                                <Ionicons name="send" size={24} color={input.trim() && !isTyping ? COLORS.primary : colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: 12, borderBottomWidth: 1 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    agentAvatar: { width: 44, height: 44, borderRadius: 22 },
    agentName: { fontSize: 18, fontWeight: '700' },
    agentStatus: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    chatContent: { padding: SPACING.lg, paddingBottom: 20 },
    messageWrapper: { marginBottom: 16, maxWidth: '85%' },
    userWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    agentWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    messageBubble: { padding: 14, borderRadius: 20 },
    userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    agentBubble: { borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    messageTime: { fontSize: 10, marginTop: 4, marginHorizontal: 4 },
    footerContainer: { borderTopWidth: 1, borderTopColor: 'transparent' },
    quickReplyScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 12, gap: 10 },
    quickReplyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, backgroundColor: 'transparent' },
    quickReplyText: { fontSize: 13, fontWeight: '600' },
    inputContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderTopWidth: 1 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
    input: { flex: 1, maxHeight: 100, fontSize: 15, paddingRight: 10 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    welcomeBox: { alignItems: 'center', justifyContent: 'center', padding: 32, marginBottom: 24, marginTop: 20 },
    welcomeTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
    welcomeDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
