// Auth Context - Oturum Yönetimi
// API veya yerel veritabanı ile çalışır

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, USE_LOCAL_DB } from '../services/ApiService';
import { databaseService, Team, TeamMember } from '../services/DatabaseService';

// ============================================================================
// TİPLER
// ============================================================================

export interface User {
    teamId: number;
    teamCode: string;
    teamName: string;
    memberId: number;
    memberName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isOnline: boolean;
    login: (teamCode: string, memberId: number) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@hasar_tespit_auth';

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);

    // Uygulama başlangıcında bağlantı ve oturum kontrolü
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Backend bağlantısını kontrol et
            if (!USE_LOCAL_DB) {
                const connected = await apiService.testConnection();
                setIsOnline(connected);
            }

            // Kayıtlı oturumu kontrol et
            await checkStoredAuth();
        } catch (error) {
            console.error('Auth başlatma hatası:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkStoredAuth = async () => {
        try {
            const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (storedUser) {
                const parsedUser: User = JSON.parse(storedUser);

                // Doğrulama yap
                if (USE_LOCAL_DB) {
                    // Yerel veritabanı modu
                    const result = await databaseService.validateLogin(
                        parsedUser.teamCode,
                        parsedUser.memberId
                    );

                    if (result) {
                        const updatedUser: User = {
                            teamId: result.team.id,
                            teamCode: result.team.team_code,
                            teamName: result.team.name,
                            memberId: result.member.id,
                            memberName: result.member.name,
                            role: result.member.role,
                        };
                        setUser(updatedUser);
                        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
                    } else {
                        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                    }
                } else {
                    // API modu - token ile doğrula
                    const response = await apiService.getMe();
                    if (response.success && response.data) {
                        const updatedUser: User = {
                            teamId: response.data.teamId,
                            teamCode: response.data.teamCode,
                            teamName: response.data.teamName,
                            memberId: response.data.memberId,
                            memberName: response.data.memberName,
                            role: response.data.role,
                        };
                        setUser(updatedUser);
                        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
                    } else {
                        await apiService.clearToken();
                        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                    }
                }
            }
        } catch (error) {
            console.error('Oturum kontrol hatası:', error);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
    };

    const login = async (
        teamCode: string,
        memberId: number
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            if (USE_LOCAL_DB) {
                // Yerel veritabanı modu
                const result = await databaseService.validateLogin(teamCode, memberId);

                if (!result) {
                    return {
                        success: false,
                        error: 'Geçersiz ekip kodu veya üye numarası',
                    };
                }

                const newUser: User = {
                    teamId: result.team.id,
                    teamCode: result.team.team_code,
                    teamName: result.team.name,
                    memberId: result.member.id,
                    memberName: result.member.name,
                    role: result.member.role,
                };

                setUser(newUser);
                await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
                return { success: true };
            } else {
                // API modu
                const response = await apiService.login(teamCode, memberId);

                if (!response.success || !response.data) {
                    return {
                        success: false,
                        error: response.error || 'Giriş başarısız',
                    };
                }

                const newUser: User = {
                    teamId: response.data.user.teamId,
                    teamCode: response.data.user.teamCode,
                    teamName: response.data.user.teamName,
                    memberId: response.data.user.memberId,
                    memberName: response.data.user.memberName,
                    role: response.data.user.role,
                };

                setUser(newUser);
                setIsOnline(true);
                await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
                return { success: true };
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            return {
                success: false,
                error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            };
        }
    };

    const logout = async () => {
        try {
            if (!USE_LOCAL_DB) {
                await apiService.logout();
            }
            setUser(null);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isOnline,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
