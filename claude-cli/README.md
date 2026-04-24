# Claude Fan-Made CLI

Terminal orqali ishlaydigan AI assistant — fayllarni **avtomatik yaratadi**!

## O'rnatish

```bash
# 1. Node.js o'rnatilganligini tekshiring
node --version   # v16+ bo'lishi kerak

# 2. Skriptni ishga tushirish huquqi bering
chmod +x claude.js

# 3. Global o'rnatish (ixtiyoriy)
npm install -g .

# 4. Ishga tushirish
node claude.js
# yoki global o'rnatilgan bo'lsa:
claude
```

## Foydalanish

```bash
# Joriy katalogda ishga tushirish
node claude.js

# Muayyan katalog bilan
node claude.js /home/user/mening-loyiham
```

## Fayl yaratish misollari

```
Siz › React login formasi yarat src/components/Login.tsx ga
Siz › Express API server yoz server.js ga
Siz › Python ma'lumotlar analiz skripti yarat analysis.py ga
Siz › index.html sahifa yarat zamonaviy dizayn bilan
```

AI o'zi fayllarni topib, `src/components/Login.tsx` kabi joylarda yaratib qo'yadi!

## Buyruqlar

| Buyruq | Vazifasi |
|--------|----------|
| `/fayl <yo'l>` | Fayllar yaratiladigan katalogni o'zgartirish |
| `/katalog` | Joriy katalogni ko'rish |
| `/tarix` | Suhbat tarixini ko'rish |
| `/tozala` | Ekranni tozalash |
| `/chiqish` | Dasturdan chiqish |

## Talablar

- Node.js v16+
- Cerebras API kaliti ([cloud.cerebras.ai](https://cloud.cerebras.ai))
