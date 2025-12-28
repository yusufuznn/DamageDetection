# Flask Backend API Spesifikasyonu

Bu doküman, mobil uygulamanın beklediği API endpoint'lerini tanımlar.
Backend'inizde bu endpoint'leri implemente edin.

## Base URL
```
http://YOUR_SERVER:5000/api
```

## Genel Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı"
}
```

Hata durumunda:
```json
{
  "success": false,
  "error": "Hata mesajı"
}
```

---

## 1. Health Check

### `GET /api/health`
Backend bağlantı kontrolü.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## 2. Authentication

### `POST /api/auth/login`
Ekip kodu ve üye numarası ile giriş.

**Request:**
```json
{
  "team_code": "TEAM001",
  "member_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "teamId": 1,
      "teamCode": "TEAM001",
      "teamName": "Afet Müdahale Ekibi 1",
      "memberId": 2,
      "memberName": "Ahmet Yılmaz",
      "role": "Ekip Lideri"
    }
  }
}
```

### `POST /api/auth/logout`
Oturum sonlandır.

**Headers:** `Authorization: Bearer <token>`

### `GET /api/auth/me`
Aktif kullanıcı bilgisi.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": 1,
    "teamCode": "TEAM001",
    "teamName": "Afet Müdahale Ekibi 1",
    "memberId": 2,
    "memberName": "Ahmet Yılmaz",
    "role": "Ekip Lideri"
  }
}
```

---

## 3. Teams

### `GET /api/teams/by-code/{team_code}`
Ekip koduna göre ekip bilgisi.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "team_code": "TEAM001",
    "name": "Afet Müdahale Ekibi 1",
    "status": "active",
    "current_latitude": 39.881697,
    "current_longitude": 33.443401,
    "created_at": "2025-12-28T09:00:00Z"
  }
}
```

### `GET /api/teams/{team_id}/members`
Ekip üyeleri listesi.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "team_id": 1,
      "name": "Ahmet Yılmaz",
      "role": "Ekip Lideri"
    },
    {
      "id": 3,
      "team_id": 1,
      "name": "Mehmet Demir",
      "role": "Teknisyen"
    }
  ]
}
```

### `PUT /api/teams/{team_id}/location`
Ekip konumunu güncelle (saha ekibi konum paylaşımı).

**Request:**
```json
{
  "latitude": 39.881697,
  "longitude": 33.443401
}
```

---

## 4. Damages

### `GET /api/damages`
Hasar listesi (query params ile filtreleme).

**Query Params:**
- `severity`: none | moderate | severe
- `damage_type`: pothole | crack | surface_wear | edge_damage | water_damage
- `status`: pending | in_progress | completed
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "team_id": 1,
      "reported_by": 2,
      "latitude": 39.881697,
      "longitude": 33.443401,
      "damage_type": "pothole",
      "severity": "severe",
      "description": "Büyük çukur",
      "image_url": "https://...",
      "confidence": 95.5,
      "road_name": "Atatürk Bulvarı",
      "status": "pending",
      "created_at": "2025-12-28T10:00:00Z"
    }
  ]
}
```

### `POST /api/damages`
Yeni hasar bildir.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "latitude": 39.881697,
  "longitude": 33.443401,
  "damage_type": "pothole",
  "severity": "severe",
  "description": "Büyük çukur - Acil müdahale gerekli",
  "image_url": "https://...",
  "road_name": "Atatürk Bulvarı"
}
```

### `PUT /api/damages/{damage_id}/status`
Hasar durumunu güncelle.

**Request:**
```json
{
  "status": "in_progress"
}
```

### `GET /api/damages/statistics`
Hasar istatistikleri.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "today": 15,
    "severe": 23,
    "moderate": 67,
    "none": 35
  }
}
```

---

## 5. Predictions (AI)

### `GET /api/predictions`
AI tahminleri listesi.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "image.png",
      "predicted_label": "agir_hasarli",
      "confidence": 95.5,
      "probabilities": "[{\"label\": \"agir_hasarli\", \"score\": 95.5}]",
      "exif_lat": 39.881697,
      "exif_lng": 33.443401,
      "created_at": "2025-12-28T10:00:00Z"
    }
  ]
}
```

### `POST /api/predictions/analyze`
Görüntü analizi (AI modeli).

**Request:**
```json
{
  "image": "base64_encoded_image",
  "location": {
    "latitude": 39.881697,
    "longitude": 33.443401
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predicted_label": "agir_hasarli",
    "confidence": 95.5,
    "probabilities": [
      { "label": "agir_hasarli", "score": 95.5 },
      { "label": "orta_hasarli", "score": 3.2 },
      { "label": "hasarsiz", "score": 1.3 }
    ]
  }
}
```

---

## Flask Örnek Implementasyon

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    team_code = data.get('team_code')
    member_id = data.get('member_id')
    
    # Veritabanından doğrula
    # ...
    
    return jsonify({
        "success": True,
        "data": {
            "token": "jwt_token",
            "user": {
                "teamId": 1,
                "teamCode": team_code,
                # ...
            }
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```
