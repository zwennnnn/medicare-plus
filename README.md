# Medicare Plus

**Medicare Plus**, klinikler için kapsamlı bir **online randevu alma, takip ve yönetim sistemi** sunar.  
Bu sistem, hasta ve doktor etkileşimini kolaylaştırırken, yönetici paneli ile de süreci uçtan uca yönetmeyi sağlar.

## İçindekiler

- [Özellikler](#özellikler)
  - [Hasta (Kullanıcı) Özellikleri](#hasta-kullanıcı-özellikleri)
  - [Doktor Özellikleri](#doktor-özellikleri)
  - [Admin Özellikleri](#admin-özellikleri)
  - [Klinik Sistemi ve Randevu Yönetimi](#klinik-sistemi-ve-randevu-yönetimi)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
  - [Gereksinimler](#gereksinimler)
  - [Backend Kurulumu](#backend-kurulumu)
  - [Backend .env Dosyası](#backend-env-dosyası)
  - [Frontend Kurulumu](#frontend-kurulumu)
  - [Frontend .env Dosyası](#frontend-env-dosyası)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## Özellikler

### Hasta (Kullanıcı) Özellikleri

- **Online Randevu Oluşturma**  
  Kullanıcılar, platform üzerinden istediği doktora veya kliniğe kısa sürede randevu talebi gönderebilir.

- **Randevu Takibi**  
  Alınan randevunun tarih, saat ve durumunu görüntüleyip takip edebilir.

- **Randevu İptali**  
  Kullanıcılar, oluşturdukları randevuları iptal edebilir ve bu sayede esneklik sağlayabilir.

- **Yorum ve Değerlendirme**  
  Hastalar, doktorlara veya aldıkları hizmete dair yorum yapabilir, puan verebilir.

- **Dinamik Doktor Listesi Görüntüleme**  
  Klinik bünyesinde yer alan tüm doktorları inceleyebilir; uzmanlık alanlarına göre listeleyebilir.

### Doktor Özellikleri

- **Doktor Paneli**  
  Doktorlar kendileri için özel olarak tasarlanmış panel aracılığıyla; 
  - Randevularını hızlıca görüntüleyebilir  
  - Randevu detaylarını inceleyip güncelleyebilir

- **Hasta Yorumlarını Görüntüleme**  
  Kendileri hakkındaki yorumları listeleyebilir ve okuyabilir.

- **Randevu Yönetimi**  
  Doktorlar, randevu durumlarını güncelleyebilir, onaylayabilir veya iptal edebilir.

### Admin Özellikleri

- **Kullanıcı Yönetimi**  
  Kullanıcı hesaplarını (hasta ve doktor) görüntüleyebilir, ekleyebilir, düzenleyebilir veya silebilir.

- **Doktor Yönetimi**  
  Doktor profillerini yönetebilir, yeni doktor ekleyebilir, mevcut doktor bilgilerini güncelleyebilir.

- **Randevu Yönetimi**  
  Sistemdeki tüm randevuları görüntüleyebilir, güncelleyebilir veya iptal edebilir.

- **İstatistikler**  
  Platformdaki kullanıcı, doktor ve randevu istatistiklerini grafikler veya tablolar halinde görüntüleyebilir.

- **Gelişmiş Admin Paneli**  
  Kullanıcı, doktor ve randevu yönetimi ile birlikte sistemin tüm temel ayarlarını merkezileştirerek yönetebilir.

### Klinik Sistemi ve Randevu Yönetimi

- **Klinik Sistemine Uygun Altyapı**  
  - Çoklu klinik desteği  
  - Klinik içi departman/uzmanlık alanı yönetimi

- **Detaylı Randevu Planlama**  
  - Randevu saat blokları ve çalışma saatleri ayarı  
  - Hasta bildirimleri ve hatırlatma mesajları (Opsiyonel)

- **Dinamik Yorum Görüntüleme**  
  - Sistem üzerinden yapılan yorumların kategorize edilmesi  
  - Klinikteki spesifik doktor veya hizmete dair filtreleme

- **Chatbot Entegrasyonu**  
  - Sık sorulan sorular için otomatik cevaplar  
  - Randevu alım sürecini hızlandıran sohbet arayüzü

---

## Teknolojiler

- **Frontend**: React.js  
- **Backend**: Node.js, Express.js  
- **Veritabanı**: MongoDB  
- **Diğer**:  
  - Cloudinary (Medya yönetimi için)  
  - JSON Web Token (JWT) ile kimlik doğrulama  
  - Chatbot & diğer üçüncü parti entegrasyonlar

---

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- MongoDB

### Backend Kurulumu

1. Proje dizininde `cd backend` komutunu çalıştırın.
2. `npm install` veya `yarn install` komutuyla bağımlılıkları yükleyin.
3. `.env` dosyasını oluşturup [aşağıdaki](#backend-env-dosyası) ortam değişkenlerini ekleyin.
4. `npm start` veya `yarn start` komutu ile backend'i başlatın.

### Backend .env Dosyası

```dotenv
PORT=5000
MONGODB_URI=mongodburl
JWT_SECRET=sizin_jwt_secret_anahtariniz
CLOUDINARY_API_KEY=sizin_cloudinary_api_keyiniz
CLOUDINARY_API_SECRET=sizin_cloudinary_api_secretiniz
CLOUDINARY_NAME=sizin_cloudinary_adınız
ADMIN_NAME=admin
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin
```


### Frontend Kurulumu

1. Proje dizininde `cd frontend` komutunu çalıştırın.
2. `npm install` veya `yarn install` komutuyla bağımlılıkları yükleyin.
3. `.env` dosyasını oluşturup [aşağıdaki](#frontend-env-dosyası) ortam değişkenlerini ekleyin.
4. `npm start` veya `yarn start` komutu ile frontend'i başlatın.

### Frontend .env Dosyası

```dotenv
VITE_API_URL=http://localhost:5000
```

### Katkıda Bulunma

Bu repoyu fork edin.
Yeni bir branch oluşturun: `git checkout -b feature/yeniOzellik`.
Değişikliklerinizi commit'leyin: `git commit -am 'Yeni özellik eklendi'`.
Branch'inize push edin: `git push origin feature/yeniOzellik`.
Projeye Pull Request gönderin.


