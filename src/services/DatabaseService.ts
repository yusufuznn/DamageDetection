// SQLite Veritabanı Servisi
// Assets'teki data.db dosyasını okur ve ekip/üye doğrulaması yapar

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

// ============================================================================
// VERİTABANI TİPLERİ
// ============================================================================

export interface Team {
    id: number;
    team_code: string;
    name: string;
    status: string;
    current_latitude: number | null;
    current_longitude: number | null;
    created_at: string;
}

export interface TeamMember {
    id: number;
    team_id: number;
    name: string;
    role: string;
}

export interface Prediction {
    id: string;
    filename: string;
    predicted_label: string;
    confidence: number;
    probabilities: string;
    exif_lat: number | null;
    exif_lng: number | null;
    exif_raw: string;
    created_at: string;
}

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;
    private isInitialized = false;

    /**
     * Veritabanını başlatır
     * Assets'teki data.db'yi document dizinine kopyalar ve açar
     */
    async initialize(): Promise<void> {
        if (this.isInitialized && this.db) {
            return;
        }

        try {
            const dbName = 'data.db';
            const docDir = FileSystem.documentDirectory;
            const dbDir = `${docDir}SQLite`;
            const dbPath = `${dbDir}/${dbName}`;

            // SQLite dizininin var olduğundan emin ol
            const dirInfo = await FileSystem.getInfoAsync(dbDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
            }

            // Veritabanı dosyasının var olup olmadığını kontrol et
            const dbInfo = await FileSystem.getInfoAsync(dbPath);

            // Geliştirme modunda her zaman yeniden kopyala
            const forceRefresh = __DEV__;

            if (!dbInfo.exists || forceRefresh) {
                // Varsa önce sil
                if (dbInfo.exists) {
                    await FileSystem.deleteAsync(dbPath, { idempotent: true });
                }

                // Assets'ten kopyala
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const asset = Asset.fromModule(require('../../assets/data.db'));
                    await asset.downloadAsync();

                    if (asset.localUri) {
                        await FileSystem.copyAsync({
                            from: asset.localUri,
                            to: dbPath,
                        });
                        console.log('Veritabanı assets\'ten kopyalandı');
                    } else {
                        console.error('Asset localUri bulunamadı');
                    }
                } catch (assetError) {
                    console.error('Asset yükleme hatası:', assetError);
                    throw assetError;
                }
            }

            // Veritabanını aç
            this.db = await SQLite.openDatabaseAsync(dbName);
            this.isInitialized = true;
            console.log('Veritabanı başarıyla açıldı');
        } catch (error) {
            console.error('Veritabanı başlatma hatası:', error);
            throw error;
        }
    }

    /**
     * Ekip koduna göre ekip bilgisini getirir
     */
    async getTeamByCode(teamCode: string): Promise<Team | null> {
        await this.initialize();
        if (!this.db) return null;

        try {
            const result = await this.db.getFirstAsync<Team>(
                'SELECT * FROM teams WHERE team_code = ?',
                teamCode
            );
            return result || null;
        } catch (error) {
            console.error('Ekip sorgulama hatası:', error);
            return null;
        }
    }

    /**
     * Ekip ID'sine göre tüm üyeleri getirir
     */
    async getTeamMembers(teamId: number): Promise<TeamMember[]> {
        await this.initialize();
        if (!this.db) return [];

        try {
            const result = await this.db.getAllAsync<TeamMember>(
                'SELECT * FROM team_members WHERE team_id = ?',
                teamId
            );
            return result;
        } catch (error) {
            console.error('Üye listesi sorgulama hatası:', error);
            return [];
        }
    }

    /**
     * Üye ID ve ekip ID'sine göre üye bilgisini getirir
     */
    async getTeamMemberById(teamId: number, memberId: number): Promise<TeamMember | null> {
        await this.initialize();
        if (!this.db) return null;

        try {
            const result = await this.db.getFirstAsync<TeamMember>(
                'SELECT * FROM team_members WHERE team_id = ? AND id = ?',
                teamId,
                memberId
            );
            return result || null;
        } catch (error) {
            console.error('Üye sorgulama hatası:', error);
            return null;
        }
    }

    /**
     * Giriş doğrulaması yapar
     * @returns Başarılıysa ekip ve üye bilgisi, başarısızsa null
     */
    async validateLogin(
        teamCode: string,
        memberId: number
    ): Promise<{ team: Team; member: TeamMember } | null> {
        const team = await this.getTeamByCode(teamCode);
        if (!team) {
            console.log('Ekip bulunamadı:', teamCode);
            return null;
        }

        const member = await this.getTeamMemberById(team.id, memberId);
        if (!member) {
            console.log('Üye bulunamadı:', memberId);
            return null;
        }

        return { team, member };
    }

    /**
     * Tüm tahminleri (hasar tespitlerini) getirir
     */
    async getAllPredictions(): Promise<Prediction[]> {
        await this.initialize();
        if (!this.db) return [];

        try {
            const result = await this.db.getAllAsync<Prediction>(
                'SELECT * FROM predictions ORDER BY created_at DESC'
            );
            return result;
        } catch (error) {
            console.error('Tahminler sorgulama hatası:', error);
            return [];
        }
    }

    /**
     * Yeni hasar tahmini ekler
     */
    async addPrediction(prediction: Omit<Prediction, 'id' | 'created_at'>): Promise<void> {
        await this.initialize();
        if (!this.db) return;

        try {
            const id = this.generateUUID();
            const createdAt = new Date().toISOString();

            await this.db.runAsync(
                `INSERT INTO predictions (id, filename, predicted_label, confidence, probabilities, exif_lat, exif_lng, exif_raw, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                id,
                prediction.filename,
                prediction.predicted_label,
                prediction.confidence,
                prediction.probabilities,
                prediction.exif_lat,
                prediction.exif_lng,
                prediction.exif_raw,
                createdAt
            );
            console.log('Tahmin eklendi:', id);
        } catch (error) {
            console.error('Tahmin ekleme hatası:', error);
            throw error;
        }
    }

    /**
     * Basit UUID üreteci
     */
    private generateUUID(): string {
        return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
            return ((Math.random() * 16) | 0).toString(16);
        });
    }

    /**
     * Veritabanı bağlantısını kapatır
     */
    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.isInitialized = false;
        }
    }
}

// Singleton instance
export const databaseService = new DatabaseService();
