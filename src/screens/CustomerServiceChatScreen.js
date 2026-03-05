import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, how can I help you today?', sender: 'agent', time: '10:00 AM' },
    { id: '2', text: 'I have a question about my last order.', sender: 'user', time: '10:01 AM' },
    { id: '3', text: 'Sure! Please provide your order ID.', sender: 'agent', time: '10:01 AM' },
];

export default function CustomerServiceChatScreen({ navigation }) {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (!input.trim()) return;
        const newUserMsg = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newUserMsg]);
        setInput('');

        // Mock auto-reply
        setTimeout(() => {
            const agentReply = {
                id: (Date.now() + 1).toString(),
                text: 'Thank you for the information. Let me check that for you.',
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, agentReply]);
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
                ref={ref => { this.scrollView = ref; }}
                onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
            >
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
        background: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
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
