# 🤖 AI Model Entegrasyon Rehberi

Bu rehber, Hasar Tespit uygulamasına gerçek AI modelinizi nasıl entegre edeceğinizi adım adım açıklamaktadır.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Model Gereksinimleri](#model-gereksinimleri)
3. [Backend API Kurulumu](#backend-api-kurulumu)
4. [Mobil Uygulama Entegrasyonu](#mobil-uygulama-entegrasyonu)
5. [Model Eğitimi Notları](#model-eğitimi-notları)
6. [Test ve Doğrulama](#test-ve-doğrulama)

---

## 🎯 Genel Bakış

### Mimari Yapı

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Mobil Uygulama │────▶│   Backend API   │────▶│    AI Model     │
│   (React Native)│◀────│   (REST/gRPC)   │◀────│  (TensorFlow/   │
│                 │     │                 │     │   PyTorch)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    Veritabanı   │
                        │  (PostgreSQL/   │
                        │    MongoDB)     │
                        └─────────────────┘
```

### Veri Akışı

1. **Görüntü Yakalama**: Cihaz kamerası veya İHA'dan görüntü alınır
2. **API Gönderim**: Görüntü base64 formatında backend'e gönderilir
3. **Model İşleme**: AI model görüntüyü analiz eder ve tahmin üretir
4. **Sonuç Döndürme**: Hasar tipi, seviye ve güven skoru döndürülür
5. **Harita Güncelleme**: Sonuçlar harita üzerinde gösterilir

---

## 📊 Model Gereksinimleri

### Desteklenen Hasar Tipleri

Modeliniz aşağıdaki hasar tiplerini sınıflandırabilmelidir:

| Hasar Tipi | Açıklama | Örnek |
|------------|----------|-------|
| `pothole` | Çukur | Derin asfalt çukurları |
| `crack` | Çatlak | Uzunlamasına/enine çatlaklar |
| `surface_wear` | Yüzey aşınması | Asfalt yıpranması |
| `edge_damage` | Kenar hasarı | Yol kenarı çöküntüleri |
| `water_damage` | Su hasarı | Su birikintisi/erozyon |

### Hasar Seviye Sınıflandırması

| Seviye | Açıklama | Öncelik |
|--------|----------|---------|
| `none` | Hasarsız | Düşük |
| `moderate` | Orta hasarlı | Orta |
| `severe` | Ağır hasarlı | Yüksek |

### Çıktı Formatı

Model çıktısı şu formatta olmalıdır:

```json
{
  "predictions": [
    {
      "damageType": "pothole",
      "severity": "severe",
      "confidence": 95.5,
      "boundingBox": {
        "x": 120,
        "y": 80,
        "width": 150,
        "height": 100
      }
    }
  ],
  "processingTime": 245
}
```

---

## 🖥️ Backend API Kurulumu

### Adım 1: API Sunucusu Oluşturma

Python Flask örneği:

```python
# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
import io

app = Flask(__name__)
CORS(app)

# Model yükleme
model = tf.keras.models.load_model('damage_detection_model.h5')

# Sınıf etiketleri
DAMAGE_TYPES = ['pothole', 'crack', 'surface_wear', 'edge_damage', 'water_damage']
SEVERITY_LEVELS = ['none', 'moderate', 'severe']

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.get_json()
        
        # Base64 görüntüyü decode et
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Görüntüyü model için hazırla
        image_array = preprocess_image(image)
        
        # Tahmin yap
        predictions = model.predict(image_array)
        
        # Sonuçları formatla
        result = format_predictions(predictions, data.get('location'))
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def preprocess_image(image, target_size=(224, 224)):
    """Görüntüyü model girdisi için hazırlar"""
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

def format_predictions(predictions, location=None):
    """Model çıktısını API formatına dönüştürür"""
    # Multi-output model varsayılıyor: [damage_type, severity]
    damage_type_idx = np.argmax(predictions[0][0])
    severity_idx = np.argmax(predictions[1][0])
    confidence = float(np.max(predictions[0][0]) * 100)
    
    return {
        'success': True,
        'predictions': [{
            'damageType': DAMAGE_TYPES[damage_type_idx],
            'severity': SEVERITY_LEVELS[severity_idx],
            'confidence': round(confidence, 2)
        }],
        'processingTime': 0,  # Gerçek süreyi hesaplayın
        'imageId': generate_image_id()
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
```

### Adım 2: Veritabanı Endpoint'leri

```python
# database_routes.py
from flask import Blueprint, jsonify
from database import get_db_connection

db_routes = Blueprint('db', __name__)

@db_routes.route('/api/damages', methods=['GET'])
def get_damages():
    """Tüm hasar kayıtlarını döndürür"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, latitude, longitude, damage_type, severity, 
               confidence, detected_at, road_name, description,
               image_url, processed, priority
        FROM damages
        ORDER BY detected_at DESC
    ''')
    
    damages = []
    for row in cursor.fetchall():
        damages.append({
            'id': row[0],
            'coordinate': {'latitude': row[1], 'longitude': row[2]},
            'damageType': row[3],
            'severity': row[4],
            'confidence': row[5],
            'detectedAt': row[6],
            'roadName': row[7],
            'description': row[8],
            'imageUrl': row[9],
            'processed': row[10],
            'priority': row[11]
        })
    
    return jsonify({'damages': damages})

@db_routes.route('/api/statistics', methods=['GET'])
def get_statistics():
    """İstatistikleri döndürür"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # İstatistikleri hesapla
    stats = calculate_statistics(cursor)
    
    return jsonify({'statistics': stats})

@db_routes.route('/api/heat-zones', methods=['GET'])
def get_heat_zones():
    """Hasar yoğunluk alanlarını döndürür"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    zones = calculate_heat_zones(cursor)
    
    return jsonify({'heatZones': zones})
```

### Adım 3: Docker ile Deploy

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Model ve kod dosyalarını kopyala
COPY . .

# Model dosyasını ayrı layer olarak kopyala (cache için)
COPY damage_detection_model.h5 /app/models/

EXPOSE 3000

CMD ["gunicorn", "-b", "0.0.0.0:3000", "server:app"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/damages
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=damages
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 📱 Mobil Uygulama Entegrasyonu

### Adım 1: Environment Değişkeni Ayarlama

`.env` dosyası oluşturun:

```env
EXPO_PUBLIC_API_URL=https://your-api-server.com/api
```

### Adım 2: Mock Modu Kapatma

`src/services/aiService.ts` dosyasında:

```typescript
// Bu değeri false yapın
export const USE_MOCK_DATA = false;
```

### Adım 3: Screen'lerde Kullanım

`MapViewScreen.tsx` örneği:

```typescript
import { useEffect, useState } from 'react';
import { fetchDamages, fetchHeatZones } from '../services/aiService';
import { mockRoadDamages, mockDamageHeatZones } from '../data/mockData';

const MapViewScreen = () => {
  const [damages, setDamages] = useState<RoadDamage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [damageData, zoneData] = await Promise.all([
        fetchDamages(mockRoadDamages),
        fetchHeatZones(mockDamageHeatZones)
      ]);
      setDamages(damageData);
      setHeatZones(zoneData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

---

## 🧠 Model Eğitimi Notları

### Önerilen Model Mimarisi

```python
import tensorflow as tf
from tensorflow.keras import layers, Model

def create_damage_model(input_shape=(224, 224, 3)):
    """Multi-output hasar tespit modeli"""
    
    # Base model (transfer learning)
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Fine-tuning için True yapın
    
    # Custom layers
    inputs = layers.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    
    # Çıktılar
    damage_type = layers.Dense(5, activation='softmax', name='damage_type')(x)
    severity = layers.Dense(3, activation='softmax', name='severity')(x)
    
    model = Model(inputs, [damage_type, severity])
    
    model.compile(
        optimizer='adam',
        loss={
            'damage_type': 'categorical_crossentropy',
            'severity': 'categorical_crossentropy'
        },
        metrics=['accuracy']
    )
    
    return model
```

### Veri Seti Yapısı

```
dataset/
├── train/
│   ├── pothole/
│   │   ├── severe/
│   │   ├── moderate/
│   │   └── none/
│   ├── crack/
│   ├── surface_wear/
│   ├── edge_damage/
│   └── water_damage/
├── validation/
│   └── (aynı yapı)
└── test/
    └── (aynı yapı)
```

### Eğitim Scripti

```python
# train.py
import tensorflow as tf
from model import create_damage_model

# Data augmentation
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True
)

# Model oluştur ve eğit
model = create_damage_model()

history = model.fit(
    train_generator,
    epochs=50,
    validation_data=val_generator,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=5),
        tf.keras.callbacks.ModelCheckpoint('best_model.h5', save_best_only=True)
    ]
)

# Modeli kaydet
model.save('damage_detection_model.h5')
```

---

## ✅ Test ve Doğrulama

### API Test Scripti

```python
# test_api.py
import requests
import base64

API_URL = "http://localhost:3000/api"

def test_health():
    response = requests.get(f"{API_URL}/health")
    assert response.status_code == 200
    print("✓ Health check passed")

def test_analyze():
    # Test görüntüsü yükle
    with open("test_image.jpg", "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        f"{API_URL}/analyze",
        json={
            "image": image_base64,
            "location": {"latitude": 39.8355, "longitude": 33.5195}
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert len(data["predictions"]) > 0
    print("✓ Image analysis passed")

def test_get_damages():
    response = requests.get(f"{API_URL}/damages")
    assert response.status_code == 200
    print("✓ Get damages passed")

if __name__ == "__main__":
    test_health()
    test_analyze()
    test_get_damages()
    print("\n🎉 All tests passed!")
```

### Mobil Uygulama Test

1. `aiService.ts` dosyasında `USE_MOCK_DATA = false` yapın
2. `.env` dosyasında API URL'ini ayarlayın
3. `expo start` ile uygulamayı çalıştırın
4. Harita ekranında verilerin yüklendiğini doğrulayın

---

## 📝 Checklist

- [ ] AI modelinizi eğitin ve kaydedin
- [ ] Backend API sunucusunu kurun
- [ ] Veritabanı şemasını oluşturun
- [ ] API endpoint'lerini test edin
- [ ] `.env` dosyasını yapılandırın
- [ ] `USE_MOCK_DATA` değerini `false` yapın
- [ ] Mobil uygulamayı test edin
- [ ] Production'a deploy edin

---

## 🆘 Destek

Sorularınız için issue açabilir veya dokümantasyonu inceleyebilirsiniz.
