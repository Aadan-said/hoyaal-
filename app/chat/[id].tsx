import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChatMessages, useCreateMessage } from '@/hooks/useChat';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();

    const [message, setMessage] = useState('');
    const { data: messages, isLoading } = useChatMessages(id as string);
    const sendMessage = useCreateMessage();
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!message.trim()) return;
        const msgToSend = message.trim();
        setMessage('');
        try {
            await sendMessage.mutateAsync({ roomId: id as string, content: msgToSend });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMine = item.sender_id === user?.id;
        return (
            <View style={[
                styles.messageWrapper,
                isMine ? styles.myMsgWrapper : styles.otherMsgWrapper
            ]}>
                {!isMine && (
                    <View style={[styles.miniAvatar, { backgroundColor: theme.primaryLight }]}>
                        <Text style={[styles.miniAvatarText, { color: theme.primary }]}>
                            {item.sender?.full_name?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isMine ? [styles.myBubble, { backgroundColor: theme.primary }] : [styles.otherBubble, { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 }]
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isMine ? '#FFF' : theme.text }
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textSecondary }
                    ]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Chat</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Property Inquiry</Text>
                </View>
                <TouchableOpacity style={styles.infoBtn}>
                    <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                    paddingBottom: insets.bottom + 12
                }]}>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={theme.textSecondary}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSend}
                            disabled={!message.trim() || sendMessage.isPending}
                        >
                            <Ionicons name="send" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 4,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    infoBtn: {
        padding: 4,
    },
    listContent: {
        padding: 24,
        paddingBottom: 40,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    myMsgWrapper: {
        alignSelf: 'flex-end',
    },
    otherMsgWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderBottomLeftRadius: 4,
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniAvatarText: {
        fontSize: 12,
        fontWeight: '700',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 24,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: 15,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    }
});
