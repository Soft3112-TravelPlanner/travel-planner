# travel-planner

SOFT3112 - Travel Planning Platform | Isik University Software Development Practice

## Katki Baslangici

Bu repoda calismaya baslamadan once [CONTRIBUTING.md](CONTRIBUTING.md) dosyasini oku.

## PowerShell'i dogru yerde nasil acacaksin

- Proje klasorunun icine gir.
- Klasorun icinde bos bir yere `Shift` tusuna basili tutarak sag tikla.
- `Terminali burada ac` veya `PowerShell penceresini burada ac` secenegine tikla.
- Komutlari acilan bu pencerede calistir.

Eger `C:\Users\kullaniciadi>` gibi baska bir klasorde komut calistirirsan dosya bulunamadi hatasi alirsin.

En temel akis:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ekibi-kur.ps1 -GitName "Ad Soyad" -GitEmail "mail@example.com"
powershell -ExecutionPolicy Bypass -File .\scripts\goreve-basla.ps1 -BranchName "feature/gorev-adi"
powershell -ExecutionPolicy Bypass -File .\scripts\degisiklikleri-gonder.ps1 -Message "feat: yaptigim degisiklik"
powershell -ExecutionPolicy Bypass -File .\scripts\pr-olustur.ps1 -Title "feat: yaptigim degisiklik"
```

Tum contributor akisi `CONTRIBUTING.md` dosyasindadir.
