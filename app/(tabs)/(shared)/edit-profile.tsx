import { uploadAvatar } from '@/api/storage';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user, updateUser } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadProfileImage(result.assets[0].uri);
        }
    };

    const uploadProfileImage = async (uri: string) => {
        if (!user) return;
        setIsUploading(true);
        try {
            const publicUrl = await uploadAvatar(user.id, uri);
            setAvatar(publicUrl);
            await updateUser({ avatar: publicUrl });
        } catch (error) {
            Alert.alert('Error', 'Waa ku guuldareystay in la soo geliyo sawirka.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Fadlan geli magacaaga.');
            return;
        }

        setIsSaving(true);
        try {
            await updateUser({ name });
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Waa ku guuldareystay in la badalo xogta.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                    <Text style={[styles.avatarLetter, { color: theme.primary }]}>
                                        {user?.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Ionicons name="camera" size={18} color="#FFF" />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>
                            Click to change profile picture
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Enter your name"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border, opacity: 0.6 }]}>
                                <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                                <TextInput
                                    value={user?.phone}
                                    editable={false}
                                    style={[styles.input, { color: theme.text }]}
                                />
                                <Ionicons name="lock-closed" size={16} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.hint, { color: theme.textSecondary }]}>Phone number cannot be changed</Text>
                        </View>
                    </View>

                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        isLoading={isSaving}
                        size="lg"
                        style={styles.saveBtn}
                    />
                </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 48,
        fontWeight: '800',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarHint: {
        fontSize: 14,
        fontWeight: '500',
    },
    form: {
        gap: 24,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    hint: {
        fontSize: 12,
        marginLeft: 4,
    },
    saveBtn: {
        height: 56,
        borderRadius: 16,
    }
});
