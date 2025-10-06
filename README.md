# 🛣️ İHA Tabanlı Yol Hasar Tespit Sistemi

İHA (İnsansız Hava Aracı) görüntülerinden AI ile yol hasarlarını tespit eden ve haritada görselleştiren React Native mobil uygulaması.

## 🎯 Özellikler

### 🗺️ **Harita Görünümü**
- **Yol Segmentleri**: Polyline ile renklendirilmiş yol durumları
- **Renk Kodlama**: Kritik (🔴), Yüksek (🟠), Orta (🟡), Düşük (🟢)
- **İnteraktif**: Yol segmentlerine tıklayarak detay bilgileri
- **GPS Entegrasyonu**: Kullanıcı konumu ve navigasyon

### 📊 **İstatistik ve Analiz**
- **Hasar Dağılımı**: Önem seviyelerine göre grafik analiz
- **Hasar Tipleri**: Çukur, çatlak, aşınma, kenar hasarı, su hasarı
- **Zaman Bazlı**: Günlük, haftalık, aylık hasar trendleri
- **Maliyet Analizi**: Tahmini onarım maliyetleri

### 📋 **Hasar Yönetimi**
- **Filtrelenebilir Liste**: Arama ve seviye filtresi
- **Detaylı Bilgiler**: Güven skoru, öncelik, maliyet
- **Durum Takibi**: İşlenme durumu ve ekip ataması
- **Pull-to-Refresh**: Gerçek zamanlı güncellemeler

### 🏠 **Dashboard**
- **Özet Bilgiler**: Toplam hasar, kritik durumlar, günlük tespitler
- **Hızlı Erişim**: Ana işlevlere kolay navigasyon
- **Canlı İstatistikler**: Gerçek zamanlı veri görünümü

## 🛠️ Teknoloji Stack

- **React Native** + **Expo** - Mobil uygulama framework'ü
- **TypeScript** - Tip güvenliği
- **React Navigation** - Sayfa yönlendirme
- **React Native Paper** - Material Design UI
- **React Native Maps** - Harita entegrasyonu
- **Expo Location** - GPS ve konum servisleri

## 🎨 Tasarım

- **Material Design 3** prensiplerine uygun
- **Responsive** tasarım (mobil optimized)
- **Accessibility** desteği
- **Renk kodlu** hasar seviye sistemi

## 📱 Ekran Görüntüleri

### Ana Sayfa
- Dashboard görünümü
- Hızlı eylem kartları
- Özet istatistikler

### Harita
- Renkli yol segmentleri
- İnteraktif hasar noktaları  
- Detay popup'ları

### Hasar Listesi
- Filtrelenebilir hasar kayıtları
- Arama fonksiyonu
- Detaylı bilgi kartları

### İstatistikler
- Grafik analiz
- Trend göstergeleri
- Maliyet hesaplamaları

## 🚀 Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/yusufuznn/DamageDetection.git

# Proje dizinine gidin
cd DamageDetection

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

## 📋 Gereksinimler

- **Node.js** v16 veya üzeri
- **Expo CLI** global olarak yüklü
- **iOS Simulator** veya **Android Emulator**
- **Expo Go** app (fiziksel cihaz için)

## 🤖 AI Entegrasyonu

Uygulama AI görüntü işleme sistemi için hazır altyapıya sahip:

```typescript
interface AIDetectionResult {
  coordinate: { latitude: number; longitude: number };
  damageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  imageUrl: string; // İHA görüntüsü
}
```

## 🌟 Gelecek Özellikler

- [ ] **Gerçek AI Entegrasyonu** - İHA görüntü analizi
- [ ] **Offline Mod** - İnternet bağlantısı olmadan çalışma
- [ ] **Push Notifications** - Kritik hasar bildirimleri
- [ ] **Export Functionality** - PDF/Excel rapor çıktısı
- [ ] **Multi-Language** - Çoklu dil desteği
- [ ] **Dark Mode** - Karanlık tema seçeneği

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit atın (`git commit -m 'Add some amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

## 👥 Geliştirici Ekibi

- **Mobile App Development** - [Yusuf Uzun](https://github.com/yusufuznn)
- **AI Computer Vision** - Geliştirme aşamasında
- **Backend Services** - Planlama aşamasında

## 📞 İletişim

- **GitHub**: [@yusufuznn](https://github.com/yusufuznn)
- **Project Link**: [https://github.com/yusufuznn/DamageDetection](https://github.com/yusufuznn/DamageDetection)

---

⭐ **Bu proje faydalı olduysa yıldız vermeyi unutmayın!**
