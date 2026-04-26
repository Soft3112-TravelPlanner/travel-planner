# Yapılan Değişiklikler

Bu döküman US-02 ve US-05 kapsamında yapılan backend ve frontend değişikliklerini özetler.

---

## Yeni Dosyalar

```
backend/
├── src/
│   ├── config/db.js          # MySQL bağlantı havuzu + tablo otomatik oluşturma
│   ├── middleware/auth.js    # JWT doğrulama middleware
│   ├── routes/auth.js        # /auth route tanımları
│   ├── controllers/
│   │   └── authController.js # Login, logout, change-password iş mantığı
│   └── app.js                # Express uygulaması, CORS, route mounting
├── .env                      # Ortam değişkenleri (git'e commit edilmez)
└── server.js                 # Sunucu başlatıcı
```

---

## US-02 — Kullanıcı Girişi

**Endpoint:** `POST /auth/login`

**İstek:**
```json
{
  "email": "test@test.com",
  "password": "Test123!",
  "rememberMe": false
}
```

**Yanıt (başarılı):**
```json
{
  "token": "<JWT>",
  "user": { "id": 1, "email": "test@test.com", ... }
}
```

**Özellikler:**
- Şifre bcrypt ile doğrulanır
- `rememberMe: true` → token 30 gün geçerli
- `rememberMe: false` → token 1 gün geçerli
- 5 hatalı girişte hesap 15 dakika kilitlenir
- Hata mesajı her zaman `"E-posta veya şifre hatalı"` (güvenlik gereği detay verilmez)

**Veritabanı:**
- `users` tablosunda `failed_attempts` ve `lock_until` alanları kullanılır

---

## US-05 — Çıkış ve Şifre Değiştirme

### `POST /auth/logout`

- `Authorization: Bearer <token>` header'ı zorunlu
- Token `token_blacklist` tablosuna eklenir
- Blacklist'teki token bir daha kullanılamaz

### `PUT /auth/change-password`

- `Authorization: Bearer <token>` header'ı zorunlu
- **İstek:** `{ currentPassword, newPassword }`
- Mevcut şifre doğrulanır
- Yeni şifre eskiyle aynı olamaz
- Şifre değişince `token_version` artırılır → tüm aktif oturumlar geçersiz kılınır

---

## Auth Middleware

`src/middleware/auth.js` her korumalı endpoint'te şunları kontrol eder:

1. `Authorization` header'ından Bearer token alınır
2. JWT imzası doğrulanır
3. Token `token_blacklist`'te var mı kontrol edilir
4. Token'daki `token_version` kullanıcının güncel versiyonuyla eşleşiyor mu kontrol edilir
5. Tüm kontroller geçilirse `req.user` set edilir

---

## Veritabanı Tabloları

Sunucu ilk başlatıldığında otomatik oluşturulur.

**users**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT PK | Otomatik artan |
| email | VARCHAR(191) UNIQUE | Giriş için |
| password_hash | VARCHAR(255) | Bcrypt hash |
| failed_attempts | INT | Hatalı giriş sayacı |
| lock_until | DATETIME | Hesap kilit bitiş zamanı |
| token_version | INT | Oturum geçersizleştirme için |
| role | ENUM('user','admin') | Kullanıcı rolü |

**token_blacklist**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT PK | Otomatik artan |
| token | TEXT | Geçersiz kılınan token |
| created_at | TIMESTAMP | Eklenme zamanı |

---

## Frontend Değişiklikleri

**`src/routes/_app/auth/login/index.tsx`**
- `setTimeout` simülasyonu kaldırıldı
- `POST http://localhost:3001/auth/login` çağrısı eklendi
- Başarılı girişte token ve kullanıcı bilgisi `localStorage`'a (`travel-planner-profile`) kaydedilir
- Hata durumunda `"E-posta veya şifre hatalı"` mesajı gösterilir

**`src/routes/_app/auth/logout/index.tsx`**
- `POST http://localhost:3001/auth/logout` çağrısı eklendi
- Token backend'e gönderilip blacklist'e alındıktan sonra localStorage temizlenir
- Backend'e ulaşılamazsa yine de güvenli çıkış yapılır

**`src/routes/_app.tsx`**
- Header dinamik hale getirildi
- Token varsa: Profil + Logout butonu gösterilir
- Token yoksa: Login + Register butonu gösterilir
