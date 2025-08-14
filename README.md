# Firewall Rule Filter 🔍

Bu proje PostgreSQL’den alınmış bir **SQL dump** dosyasındaki güvenlik kuralı tablolarını okuyup **tekil "Rule" objeleri** haline getiren, kurallar arasındaki **çakışma/örtüşme** durumlarını (adres/protokol/port düzeyinde) analiz eden ve sonucu istemci tarafında görselleştiren bir uygulamadır.

> Sunucu için Node.js + Express, istemci için React kullanılmıştır. Dosya yükleme için Multer, SQL içeriğini geçici veritabanına aktarmak için PostgreSQL CLI (psql - pg\_restore) kullanıldı.

<br/>

### **Firewall Kurallarında Çakışma Analizinin Önemi ve Faydaları**

* **Güvenlik Risklerini Önler** : Çakışan kurallar, **yanlış izin/red** durumlarına yol açarak ağı savunmasız bırakabilir.
* **Tutarlı Politika Uygulamasını Sağlar** : Kuralların birbiriyle çelişmemesi, **hedeflenen güvenlik politikasının doğru çalışmasını** garanti eder.
* **Performansı Artırır** : Gereksiz veya tekrarlayan kuralların temizlenmesi, **firewall işlem yükünü azaltır** ve trafik akışını hızlandırır.
* **Kural Karmaşasını Azaltır** : Kullanılmayan veya gölgelenen (shadowed) kurallar silinerek **yönetim kolaylaşır**.
* **Hata Ayıklamayı Kolaylaştırır** : Sorun tespiti, **düzenli ve çakışmasız bir kural kümesiyle** daha hızlı yapılır.
<br/>


## Kullanılan Teknolojiler

* **Node.js** & **Express** (API ve sunucu işlemleri)
* **React** (istemci arayüzü)
* **Tailwind** (CSS)
* **Multer** (dosya yükleme)
* **PostgreSQL CLI** (`psql`, `pg_restore`) – dump yükleme ve veri çekme
* **Axios** (istemci-sunucu iletişimi)
* **JavaScript** (ES6+), **HTML5**, **CSS3**
* **CIDR/IP kütüphaneleri**:

  * ip6addr -> Basit ama daha az net sonuç
  * ip-address -> Detaylı analiz 
  * net
  * ip-cidr

## Özellikler

* **.sql** dosyası yükleme ve süreç hakkında bilgilendirme
* Dump dosyasını geçici bir veritabanına işleme ve gerekli tablolardan kayıtları çekme
* İlişkili tablolardan gelen verileri birleştirerek **tam Rule objesi** oluşturma
* **Çakışma analizi**: her kural diğer tüm kurallarla karşılaştırılır; adres/protokol/port kırılımlarında örtüşme yüzdeleri hesaplanır
* **IPv4/IPv6 ayrı değerlendirme** (karşılaştırma yapılmaz)
* Sonuçların **tabloda ve modal** içinde işaretlenerek gösterimi

## Veri Kaynakları (beklenen tablolar)

* `tb_guvenlikKurallari` : Temel güvenlik kuralı kayıtları
* `tb_guvenlikKurallari_gruplari` : Kural grupları ve bağları
* `tb_servisTanimlari` : Servis tanımları (ör. web, dns)
* `tb_servisTanimlari_uyeler` : Servis tanımı üyeleri (port/protokol detayları)
* `tb_servis_atama` : Servislerin kurallara/nesnelere atanması
* `tb_protokoller` : Protokol referansları

### Rule Oluşturma (özet akış)

1. `.sql` dump geçici veritabanına yüklenir.
2. Yukarıdaki tablolardan ilgili kayıtlar çekilir.
3. `createFullRule(...)` ile parçalı veriler tek bir **Rule** objesinde birleştirilir.

### Çakışma Analizi (özet)

* Her **rule** diğer tüm **rule**’larla adres/protokol/port bazında karşılaştırılır.
* Kaynak ve hedef ağ kapsamlarında (CIDR/IP) kesişimler hesaplanır, bu kesişim yüzdelerine port ve protokollerin de kesişim yüzdeleri eklenerek genel çakışma(conflict) yüzdesi bulunur.
* Örtüşme **yüzdeleri** hesaplanarak daha okunaklı ondalık formatta döndürülür.
* Çakışma bulunan satırlar tabloda **işaretlenir**, detaylar modal’da listelenir.

## Kurulum

### Gereksinimler

* **Node.js >= 18**, **npm >= 9**
* **PostgreSQL** (yerelde yüklü; `psql`, `pg_restore`komutları PATH’te)
* Yerel PostgreSQL için parola istemeden çalışacak bir yapılandırma veya `PGPASSWORD` ortam değişkeni (sunucu, `-U postgres` ile CLI çağırır)

## Kullanım

### Arayüzden

1. **SQL dump (.sql)** dosyasını yükleyin.
2. Yükleme tamamlanınca **Analiz** butonuna basın.
3. Tablodaki satırlarda çakışma işaretlerini ve modal’daki detayları inceleyin.

## Önemli Notlar & Sınırlamalar

* Büyük `.sql` dosyalarında yükleme ve içe aktarma **zaman alabilir** , bunun nedeni kullanılan "child\_process" fonksiyonunun "exec" (hafif komutlar için) olmasıdır. Bunun yerine yine "child\_process" in "spawn" fonksiyonu kullanılabilir. 

* **IPv4 ve IPv6** ayrı değerlendirilir; birbirleriyle karşılaştırma yapılmaz.

* Sunucunun `psql - pg_restore` komutlarına erişebilmesi gerekir.

* Dump içeriğinde yukarıdaki tablolar yoksa tam Rule oluşturma **eksik** kalır, proje çalışmaz.

<br/>
<img width="1072" height="702" alt="Screen Shot 2025-08-14 at 10 28 17 AM" src="https://github.com/user-attachments/assets/e6a58b31-35d0-42de-a26b-8a0e33843c6a" />
<img width="2638" height="1656" alt="Screen Shot 2025-08-14 at 10 29 33 AM" src="https://github.com/user-attachments/assets/483f79d3-1045-431d-bac6-36b52b040ab6" />
<img width="2666" height="1636" alt="Screen Shot 2025-08-14 at 10 30 02 AM" src="https://github.com/user-attachments/assets/0e3d344c-c7be-4dff-a4d0-af90656c12e6" />
<img width="2630" height="1632" alt="Screen Shot 2025-08-14 at 10 30 18 AM" src="https://github.com/user-attachments/assets/ff8d58d6-75b8-4642-8240-1b61a67929d0" />




