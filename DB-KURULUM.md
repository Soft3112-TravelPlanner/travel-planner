# Backend Kurulum Rehberi

## Gereksinimler

- Node.js v18+
- WAMP Server (MySQL için)

---

## 1. WAMP Kurulumu

[wampserver.aviatechno.net](https://wampserver.aviatechno.net/files/install/wampserver3.4.0_x64.exe) adresinden indir ve kur.

### VC++ Hatası Alırsan

Kurulum sırasında şu hata çıkabilir:
```
VC_2022_REDIST_X86 - NOT INSTALLED
```

Çözüm:
1. Şu iki dosyayı indir ve kur:
   - https://aka.ms/vs/17/release/vc_redist.x64.exe
   - https://aka.ms/vs/17/release/vc_redist.x86.exe
2. Bilgisayarı yeniden başlat
3. WAMP kurulumuna tekrar devam et

WAMP kurulduktan sonra başlat — sistem tepsisinde **yeşil** yanmalı.

---

## 2. Veritabanı Oluşturma

WAMP yeşil yandıktan sonra:

1. http://localhost/phpmyadmin adresine git
2. Kullanıcı: `root` / Şifre: *(boş bırak)*
3. Sol üstten **Yeni** → Database adı `rovera_db` → Oluştur

Tabloları manuel oluşturmana gerek yok — sunucu ilk başlatıldığında otomatik oluşturulur.

---

## 3. Bağımlılıkları Yükle

```bash
cd backend
npm install
```

---

## 4. .env Dosyasını Oluştur

`backend/` klasörü içinde `.env` adında bir dosya oluştur ve şunları yapıştır:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=rovera_db
JWT_SECRET=rovera_super_secret_key
PORT=3001
```

> `.env` dosyası `.gitignore`'da olduğu için her kişi kendi bilgisayarında oluşturmalı.

---

## 5. Sunucuyu Başlat

```bash
npm run dev
```

Terminalde şunu görmelisin:

```
Server is running on port 3001
Database tables initialized
```

Bu çıktıyı gördüysen backend hazır.

---

## 6. Test Kullanıcısı Oluşturma (Opsiyonel)

Register endpoint'i henüz olmadığı için test yapmak istiyorsan phpMyAdmin → `rovera_db` → SQL sekmesine şunu yapıştır:

```sql
INSERT INTO users (first_name, last_name, username, email, password_hash, role)
VALUES ('Test', 'User', 'testuser', 'test@test.com',
'$2b$10$W11qrCJLRn6z8j7uE/s1kuITGI0kbZIANPwAr4NoAQknAlukwK9vS', 'user');
```

Şifre: `Test123!`
