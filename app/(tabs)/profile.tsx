import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/welcome');
    };

    const MenuItem = ({ icon, label, onPress, isDestructive = false }: { icon: any, label: string, onPress?: () => void, isDestructive?: boolean }) => (
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconInfo}>
                <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : theme.inputBackground }]}>
                    <Ionicons name={icon} size={20} color={isDestructive ? '#DC2626' : theme.primary} />
                </View>
                <Text style={[styles.menuText, { color: isDestructive ? '#DC2626' : theme.text }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    if (!user) {
        // Fallback or loading state
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.textSecondary }}>Checking session...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
                {/* Profile Header */}
                <View style={[styles.header, { backgroundColor: theme.card }]}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatarImage, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: '#FFF', fontSize: 40, fontWeight: '800' }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </Text>
                            </View>
                            <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.text }]}>
                                <Ionicons name="camera" size={12} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.roleTextBadge, { color: theme.primary }]}>{user.role}</Text>
                            </View>
                        </View>
                        <Text style={[styles.phone, { color: theme.textSecondary }]}>{user.phone}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Listings</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.text }]}>5.0</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rating</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reviews</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Menu */}
                <View style={styles.menuContainer}>
                    {(user.role === 'OWNER' || user.role === 'AGENT') && (
                        <>
                            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Management</Text>
                            <View style={styles.menuGroup}>
                                <MenuItem icon="business-outline" label="My Listings" onPress={() => { }} />
                                <MenuItem icon="stats-chart-outline" label="Performance" onPress={() => { }} />
                            </View>
                        </>
                    )}

                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Account Settings</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem icon="person-outline" label="Edit Profile" />
                        <MenuItem icon="notifications-outline" label="Notifications" />
                        <MenuItem icon="shield-checkmark-outline" label="Privacy & Security" />
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>App</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem icon="settings-outline" label="Preferences" />
                        <MenuItem icon="language-outline" label="Language (Somali)" />
                        <MenuItem icon="help-circle-outline" label="Help & Support" />
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Session</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem icon="log-out-outline" label="Log Out" isDestructive onPress={handleLogout} />
                    </View>
                </View>

                {/* Version Info */}
                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: theme.textSecondary }]}>Hoyaal App v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        paddingBottom: 32,
        paddingTop: 16,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 16,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleTextBadge: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    phone: {
        fontSize: 16,
        marginBottom: 24,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 24,
        opacity: 0.2,
    },
    menuContainer: {
        paddingHorizontal: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 12,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    menuGroup: {
        borderRadius: 20,
        marginBottom: 8,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 2,
        borderRadius: 16,
    },
    menuIconInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    versionText: {
        fontSize: 13,
        opacity: 0.6,
    },
});
