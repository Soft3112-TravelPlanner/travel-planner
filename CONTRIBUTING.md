# Katki Rehberi

Bu repo icin ana giris noktasi bu dosyadir. Git veya GitHub bilmiyorsan bile asagidaki adimlari takip ederek guvenli sekilde calisabilirsin.

## Baslamadan once

Bu projede:

- `main` dalina dogrudan calisilmaz.
- `main` ve `dev` dalina dogrudan push atilmaz.
- Her is yeni bir dalda yapilir.
- Her degisiklik pull request ile gonderilir.

## PowerShell'i nerede acacaksin

- Proje klasorunun icine gir.
- Klasorun icinde bos bir yere `Shift` tusuna basili tutup sag tikla.
- `Terminali burada ac` veya `PowerShell penceresini burada ac` secenegine tikla.
- Acilan pencere proje klasorunde olmalidir.

Yanlis yerde acarsan komutlar dosyalari bulamaz.

## Bir kez yapilacak kurulum

Depo kok dizininde PowerShell ac ve su komutu calistir:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ekibi-kur.ps1 -GitName "Ad Soyad" -GitEmail "mail@example.com"
```

Bu komut:

- gerekli araclari kontrol eder
- Git hook'larini acar
- Git kullanici bilgilerini ayarlar
- sana sonraki adimi soyler

## `gh auth login` ekraninda ne sececeksin

Eger script senden `gh auth login` isterse, komutu calistirdiktan sonra su sirayi takip et:

1. `GitHub.com`
2. `HTTPS`
3. `Yes`
4. `Login with a web browser`

Sonra tarayici acilir. GitHub izin ekranini onayla ve terminale geri don.

## Her yeni gorev icin yapacagin 3 komut

### 1. Gorev dalini ac

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\goreve-basla.ps1 -BranchName "feature/gorev-adi"
```

Ornekler:

- `feature/login-page`
- `fix/navbar-overflow`
- `docs/kurulum-rehberi`
- `chore/repo-cleanup`

### 2. Degisikliklerini gonder

Kodunu yazdiktan sonra:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\degisiklikleri-gonder.ps1 -Message "feat: login sayfasini ekle"
```

Ornek commit mesajlari:

- `feat: login sayfasini ekle`
- `fix: navbar tasmasini duzelt`
- `docs: katki rehberini guncelle`
- `chore: gereksiz dosyalari temizle`

### 3. Pull request olustur

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pr-olustur.ps1 -Title "feat: login sayfasini ekle"
```

## Pull request acildiktan sonra ne olacak

- GitHub Actions otomatik calisir.
- SonarCloud analizi otomatik baslar.
- Reviewer veya proje yoneticisi PR'ini inceler.
- Senden duzeltme istenirse ayni dal uzerinden devam edersin.

## Review geldiyse ne yapacaksin

Ayni dalda gerekli duzeltmeleri yap, sonra su komutu calistir:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\gorevi-guncelle.ps1 -Message "fix: review duzeltmelerini uygula"
```

Bu komut ayni pull request'i gunceller. Yeni PR acmana gerek yoktur.

## Isin merge edildiyse ne yapacaksin

PR merge edildikten sonra temizlik icin:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\gorevi-bitir.ps1
```

Bu komut seni tekrar guncel `main` dalina getirir ve eski gorev dalini temizler. GitHub'da is zaten merge edildigi icin yerel dal zorla silinir; bu normaldir.

## Sik sorulan sorular

### Branch nedir

Branch, yaptigin degisiklikleri ana koddan ayri sekilde tutan calisma alanidir.

### Pull request nedir

Pull request, yaptigin degisiklikleri inceleme ve birlestirme istegidir.

### Hata alirsam ne yapmaliyim

Scriptin verdigi sari veya kirmizi mesaji dikkatle oku. Genelde sonraki adim sana net olarak soylenir.

### Ayni branch'e tekrar commit gonderebilir miyim

Evet. Review sonrasi duzeltmeler icin `gorevi-guncelle.ps1` kullanmalisin.

### GitHub Desktop kullanabilir miyim

Evet, ama bu repoda ana akis PowerShell scriptleri uzerinden tasarlandi. En guvenli yol scriptleri kullanmaktir.
