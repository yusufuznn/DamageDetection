// Login Screen - Ekip Giriş Ekranı
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Card,
    HelperText,
    ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();

    const [teamCode, setTeamCode] = useState('');
    const [memberId, setMemberId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        // Validasyon
        if (!teamCode.trim()) {
            setError('Ekip kodu gereklidir');
            return;
        }

        const memberIdNum = parseInt(memberId, 10);
        if (isNaN(memberIdNum) || memberIdNum <= 0) {
            setError('Geçerli bir üye numarası giriniz');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const result = await login(teamCode.trim().toUpperCase(), memberIdNum);

            if (!result.success) {
                setError(result.error || 'Giriş başarısız');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🏗️</Text>
                    </View>
                    <Text style={styles.title}>Hasar Tespit</Text>
                    <Text style={styles.subtitle}>Afet Değerlendirme Sistemi</Text>
                </View>

                {/* Login Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Ekip Girişi</Text>
                        <Text style={styles.cardDescription}>
                            Komuta merkezi tarafından atanan ekip bilgilerinizi girin
                        </Text>

                        {/* Ekip Kodu */}
                        <TextInput
                            label="Ekip Kodu"
                            value={teamCode}
                            onChangeText={(text) => {
                                setTeamCode(text.toUpperCase());
                                setError('');
                            }}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Örn: TEAM001"
                            autoCapitalize="characters"
                            left={<TextInput.Icon icon="account-group" />}
                            disabled={isLoading}
                        />

                        {/* Üye Numarası */}
                        <TextInput
                            label="Üye Numarası"
                            value={memberId}
                            onChangeText={(text) => {
                                setMemberId(text.replace(/[^0-9]/g, ''));
                                setError('');
                            }}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Örn: 1"
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="card-account-details" />}
                            disabled={isLoading}
                        />

                        {/* Hata Mesajı */}
                        <HelperText type="error" visible={!!error} style={styles.errorText}>
                            {error}
                        </HelperText>

                        {/* Giriş Butonu */}
                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </Card.Content>
                </Card>

                {/* Footer */}
                <Text style={styles.footer}>
                    Saha Ekibi Hasar Değerlendirme Uygulaması
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0E7490',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#0E7490',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 14,
        marginBottom: 8,
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
        backgroundColor: '#0E7490',
    },
    buttonContent: {
        paddingVertical: 8,
    },
    footer: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 32,
    },
});
