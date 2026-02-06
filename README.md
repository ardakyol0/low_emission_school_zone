# Düşük Karbonlu Okul Yolu - Low-Emission School Zone

Serik ilçesindeki okul yollarını daha güvenli ve düşük karbonlu hale getirmek için tasarlanmış bir harita simülasyon projesi. Okul saatlerinde belirli yolların kapatılması ve trafik akışının yönetilmesiyle emisyonları azaltmayı hedefliyor.

## 📁 Proje Yapısı

```text
manifest/
├── backend/                    # Backend API ve veritabanı
│   ├── api/
│   │   ├── main.py            # FastAPI servisi
│   │   ├── schema.sql         # PostgreSQL/PostGIS şeması
│   │   ├── requirements.txt   # Python bağımlılıkları
│   │   └── .env.example       # Veritabanı yapılandırma örneği
│   └── load_geojson.py        # GeoJSON → PostgreSQL yükleme scripti
│
├── data/
│   └── processed/
│       └── low_emission_simulation.geojson  # Ana veri dosyası
│
└── frontend/                   # Web harita arayüzü
    ├── index.html             # Ana HTML sayfa
    └── app.js                 # Leaflet harita kodu

```

## 🎨 Tasarım Özellikleri

- **Modern UI/UX:** Glassmorphism efektleri ve gradient renkler
- **Animasyonlar:** Pulse, shimmer ve status blink efektleri
- **Responsive:** Mobil cihazlarda da düzgün çalışır
- **Smooth Transitions:** Tüm geçişler akıcı ve profesyonel
- **Custom Variables:** CSS değişkenleri ile kolay tema özelleştirme

## 🔧 İleri Düzey Kurulum (Backend ile)

### 1. Gereksinimler

- Python 3.8+
- PostgreSQL 12+ + PostGIS extension
- Modern web tarayıcı

### 2. PostgreSQL/PostGIS Kurulumu

```bash
# PostgreSQL ve PostGIS'i kurun (macOS)
brew install postgresql postgis

# PostgreSQL'i başlatın
brew services start postgresql

# Veritabanı oluşturun
createdb belek_gis
psql belek_gis -c "CREATE EXTENSION postgis;"
```

### 3. Backend Kurulumu

```bash
cd backend/api

# .env dosyası oluşturun
cp .env.example .env
# .env dosyasını düzenleyerek veritabanı bilgilerinizi girin

# Veritabanı şemasını oluşturun
psql -U postgres -d belek_gis -f schema.sql

# Python bağımlılıklarını yükleyin
pip install -r requirements.txt
```

### 4. Veri Yükleme

```bash
cd backend

# GeoJSON verisini PostgreSQL'e yükleyin
python load_geojson.py ../data/processed/low_emission_simulation.geojson
```

## 🚀 Hızlı Başlangıç

En basit kullanım şekli (Backend'e gerek yok):

```bash
cd frontend
python3 -m http.server 8080
```

Tarayıcıda aç: `http://localhost:8080`

> **Not:** Frontend, `data/processed/low_emission_simulation.geojson` dosyasını doğrudan kullanır. Backend isteğe bağlıdır.

## 📊 İstatistikler

Sağ panelde gerçek zamanlı olarak şunları görebilirsiniz:

- **Toplam Okul:** Bölgedeki okul sayısı
- **Kapalı Yol:** Okul saatlerinde kapatılan yol sayısı (normal saatlerde 0)
- **Açık Yol:** Aktif trafik akışı olan yol sayısı
- **Aktif Katman:** Haritada görüntülenen katman sayısı

İstatistikler, zaman simülasyonuna göre otomatik güncellenir.

## 🗺️ Harita Özellikleri

### Katman Tipleri

- **Okullar** (Kırmızı) - Eğitim tesisleri ve etki alanları
- **Güvenlik Tamponu** (Sarı/Altın) - Okul çevresinde 200m güvenlik bölgesi
- **Kapalı Yollar** (Koyu Kırmızı, kesikli çizgi) - Okul saatlerinde kapatılan yollar
- **Açık Yollar** (Yeşil) - Normal trafik akışı olan yollar

### Zaman Simülasyonu

Projenin en önemli özelliği, zaman bazlı simülasyon yapabilmesidir:

- **Saat Seçimi:** 07:00 - 18:00 arası herhangi bir saati seçebilirsiniz
- **Okul Giriş Saati:** 08:00-09:00 arası yollar kısıtlanır
- **Okul Çıkış Saati:** 15:00-16:00 arası yollar kısıtlanır
- **Dinamik Görselleştirme:** Seçilen saate göre kapalı yollar otomatik olarak vurgulanır
- **Trafik Durumu:** Anlık trafik durumu göstergesi (Normal/Kısıtlı)
- **Hava Kalitesi:** Simüle edilmiş AQI (Air Quality Index) değeri
  - Okul saatlerinde: 25-40 (Mükemmel)
  - Normal saatlerde: 45-65 (İyi)

### İnteraktif Özellikler

- Katmanları açma/kapatma
- Her özelliğe tıklayarak detaylı bilgi görüntüleme
- Zoom ve pan navigasyonu
- OpenStreetMap taban haritası
- Zaman kaydırıcısı ile dinamik simülasyon
- Gerçek zamanlı istatistik güncellemesi

## 📊 API Endpoints

| Endpoint             | Açıklama                     |
| -------------------- | ---------------------------- |
| `GET /`              | API bilgisi                  |
| `GET /api/features`  | Tüm özellikler (GeoJSON)     |
| `GET /api/schools`   | Sadece okullar               |
| `GET /api/roads`     | Sadece kapalı yollar         |
| `GET /api/buffer-zones` | Sadece tampon bölgeler    |
| `GET /api/stats`     | İstatistiksel özet           |
| `GET /health`        | Veritabanı bağlantı kontrolü |

## 🔧 Yapılandırma

### Veritabanı (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=belek_gis
DB_USER=postgres
DB_PASSWORD=postgres
```

### Renk Paleti

- Okullar: `#FF4444` (kenar), `#FF8888` (dolgu)
- Güvenlik Tamponu: `#FFAA00` (kenar), `#FFD700` (dolgu)
- Kapalı Yollar: `#CC0000` (okul saatlerinde vurgulu)
- Açık Yollar: `#00AA00` (yeşil)
- Primary Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

## 🎯 Proje Hedefleri

Bu proje, şehir planlamacılarına ve karar vericilere şunları göstermeyi amaçlar:

- Okul çevrelerinde trafik kısıtlamasının etkisi
- Zamana göre değişen trafik yönetimi
- Düşük karbonlu ulaşım alternatiflerinin önemi
- Hava kalitesi iyileşmelerinin simülasyonu

## 📝 Veri Formatı

GeoJSON dosyası aşağıdaki yapıda olmalıdır:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[31.06, 36.86], ...]]
      },
      "properties": {
        "name": "Örnek Okul",
        "layer_type": "school"
      }
    }
  ]
}
```

**Desteklenen layer_type değerleri:**

- `school` - Okul
- `buffer` - Tampon bölge (200m güvenlik alanı)
- `closed_road` - Okul saatlerinde kapalı yol
- `open_road` - Açık yol
- `road` - Genel yol
- `highway` - Anayol

## 💡 Kullanım İpuçları

1. **Zaman Simülasyonu:** Sol paneldeki kaydırıcıyı kullanarak farklı saatleri test edin
2. **Katman Filtreleme:** Sağ panelden istediğiniz katmanları açıp kapatabilirsiniz
3. **Detaylı Bilgi:** Haritadaki herhangi bir öğeye tıklayarak detayları görün
4. **Okul Saatleri:** 08:00-09:00 ve 15:00-16:00 saatlerinde kısıtlamaları gözlemleyin
5. **Hava Kalitesi:** AQI değerinin okul saatlerinde nasıl iyileştiğini görün

## 🚦 Trafik Yönetimi Mantığı

Proje, şu mantıkla çalışır:

- Normal saatlerde tüm yollar açık
- Okul giriş/çıkış saatlerinde belirli yollar kapatılır
- Kapalı yollar haritada daha belirgin gösterilir (kalınlık ve opaklık artar)
- İstatistikler gerçek zamanlı güncellenir
- Hava kalitesi, trafik yoğunluğuna göre simüle edilir

Bu yaklaşım, okul çevrelerinde araç trafiğini azaltarak:

- Karbon emisyonlarını düşürür
- Hava kalitesini iyileştirir  
- Öğrenci güvenliğini artırır

## 🛠️ Teknolojiler

**Frontend:**

- Leaflet.js - İnteraktif haritalar
- Vanilla JavaScript - Sade ve hızlı
- CSS3 - Modern animasyonlar ve efektler
- HTML5 - Semantik yapı

**Backend (İsteğe Bağlı):**

- FastAPI - Hızlı API geliştirme
- PostgreSQL + PostGIS - Coğrafi veri yönetimi
- SQLAlchemy - ORM
- Python 3.8+

**Veri:**

- GeoJSON - Coğrafi veri formatı
- OpenStreetMap - Taban harita

## 📝 Özelleştirme

### Zaman Aralığını Değiştirme

`index.html` dosyasında slider değerlerini düzenleyin:

```html
<input type="range" min="7" max="18" value="8" step="0.5" class="time-slider">
```

### Okul Saatlerini Değiştirme

`app.js` dosyasında:

```javascript
const isEntryTime = currentHour >= 8 && currentHour < 9;  // Giriş: 08:00-09:00
const isExitTime = currentHour >= 15 && currentHour < 16; // Çıkış: 15:00-16:00
```

### Stil Özelleştirme

`index.html` dosyasında CSS değişkenlerini düzenleyin:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.15);
}
```

## 📄 Lisans

MIT

---

**Geliştirici Notu:** Bu proje, sürdürülebilir şehir planlaması ve düşük karbonlu ulaşım sistemleri üzerine bir simülasyon çalışmasıdır. Gerçek dünya uygulamaları için yerel yönetimler ve trafik uzmanlarıyla işbirliği önerilir.
