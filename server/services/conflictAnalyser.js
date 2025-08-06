import { error, log } from "console";
import fs from "fs";
import CIDR from "ip-cidr";
import ip6addr from "ip6addr";
import net from "net";

/*  

ipv4 tüm adresler için -> 0.0.0.0/0
ipv6 tüm adresler için -> ::/0

ipv6, ipv4 den daha fazla alanı kapsar. 

ipv4 32 bit subnet kullanır ama ipv6 128 bit subnet kullanır, aralarında dönüşüm yapılırken
bu farka dikkat edilmelidir. 

SOR:
?? => 2 rule arasındaki genel kaynak adres çakışma yüzdesini hesaplarken hangi yöntemle
çakışma yüzdeleri tek bir yüzdelik değerde birleştirilecek;
 - tüm çakışma yüzdelerinin ortalamasının alınması
 - tüm kesişen ip sayılarının toplamı üzerinden tek bir yüzdelik değer alma



*/

function getSubRules(rule) {
  const kaynak_ips = getSubKaynakIps(rule.kaynakAdresler);
  const hedef_ips = getSubHedefIps(rule.hedefAdresler);
  const kaynak_ports = getSubKaynakPorts(rule.servisTanim_uyeleri);
  const hedef_ports = getSubHedefPorts(rule.servisTanim_uyeleri);
  const protokols = getSubProtokols(rule.servisler);
}

function getSubKaynakIps(kaynak_adresler) {
  let tam_adresler_ipv4 = [];
  let tam_adresler_ipv6 = [];
  kaynak_adresler.forEach((adres) => {
    const tam_adres = sonunaSubnetEkle(adres);
    if(checkIPVersion(tam_adres) == "IPv4"){
      tam_adresler_ipv4.push(tam_adres);
    }else if(checkIPVersion(tam_adres) == "IPv6"){
      tam_adresler_ipv6.push(tam_adres);
    }else{
      console.log("Geçersiz IP: ",adres);
    }

  });

  //Oluşan adreslerin alt ip'lerinin sayısını çıkar
  




}
function getSubHedefIps(hedef_adresler) {}
function getSubKaynakPorts(servisTanim_uyeler) {}
function getSubHedefPorts(servisTanim_uyeler) {}
function getSubProtokols(servisler) {}

function checkIPVersion(ip) {
  if (net.isIPv4(ip)) {
    return "IPv4";
  } else if (net.isIPv6(ip)) {
    return "IPv6";
  } else {
    return "Geçersiz IP";
  }
}

export function analysisRuleConflicts(rules) {
  /* 
    rule conflict analizinde ilk rule diğer tüm rule lar ile, 2. rule birinci hariç
    diğer tüm rule lar ile ... bu şekilde devam ederek hiçbir rule bir başka rule ile 2
    defa analiz edilmeden tüm rule lar analiz edilmesi gerekiyor. 
    */

  /* 
  YENİ CONFLICT ANALİZİ
  
  Analiz yapılırken yeni yöntemde gelen rule listesindeki tüm rule'lar birbirleri ile sadece 1 kez çakışma analizi yapılacak şekilde 
  kontrol edilecekler , 2 rule arasında çakışma analizi yapılırken önce her rule'dan oluşturulabilecek max alt rule listeleri oluşturulacak
  ve bu 2 rule'dan oluşan alt rule listeleri birbirleri ile karşılaştırılacak. İçlerinden aynı olanlar varsa bunlar çakışma anlamına gelecek,
  sonrasında toplam çakışma olan alt rule sayısı ve analize giren 2 rule'dan oluşan alt rule sayıları kullanılarak 2 rule arasında % kaçlık
  çakışma olduğu çıktısı alınacak.  
  */

  console.log("===> Analize başlandı... ");

  getSubRules(rules[0]);

  return;

  let analysises = [];

  for (let i = 0; i < rules.length; i++) {
    const rule1 = rules[i];

    // 2. rule seçilecek zaman her zaman birincidekinden sonraki rule lar arasından bir tanesi seçilecek
    for (let j = i + 1; j < rules.length; j++) {
      const rule2 = rules[j];

      // her 2 farklı rule için analiz fonk çalıştır.
      const rules_analysis = analysis2Rule(rule1, i, rule2, j);
      analysises.push(rules_analysis);
    }
  }

  console.log("==== Analiz Tamamlandı.");
  console.log("Toplam rule sayısı: ", rules.length);
  console.log(
    "Olması gereken analiz sayısı: ",
    (rules.length * (rules.length - 1)) / 2
  );
  console.log("Toplam analiz sayısı:", analysises.length);

  return analysises;
}

















// burada 2 rule analizi yapılır , birbirlerini % kaç ezdikleri bilgisini döner.
function analysis2Rule(rule1, index1, rule2, index2) {
  console.log("==== Analiz Başlangıcı ---->");
  let conflictPertencagesList = [];

  let totalOrtakIp = 0n;
  let totalRule1Ip = 0n;
  let totalRule2Ip = 0n;

  rule1.kaynakAdres.forEach((item1) => {
    rule2.kaynakAdres.forEach((item2) => {
      if (item1.ipAdresi && item2.ipAdresi) {
        // 123.123.123.123 olarak geldiyse adresi 123.123.123.123/32 formatında dönüştürme
        const item1FormattedIp = sonunaSubnetEkle(item1.ipAdresi);
        const item2FormattedIp = sonunaSubnetEkle(item2.ipAdresi);

        console.log("1. Adres: ", item1FormattedIp);
        console.log("2. Adres: ", item2FormattedIp);

        let conflictPertencageTotal = null;
        let ortakIp = 0n;
        let ipSayisiRule1 = 0n;
        let ipSayisiRule2 = 0n;

        // özel durumlardaki ipAdress değerleri kontrolü
        try {
          if (item1FormattedIp == "::/0" || item2FormattedIp == "::/0") {
            // ::/0 olarak gelen adresler ip6 türünde olduğu için ip6addr kullanılacak
            // özel formattki adresler için hesaplama

            /* 
            ::/0 şeklinde gelen bir ip ile normal ipV4 türündeki bir ip karşılıştırılırken
            ya ::/0 türündeki ip diğer ip'nin tamamını(%100) kapsar yada diğer ip, ::/0 türündeki ip'nin
            belli bir kısmını kapsar ve bu da yüzdelik olarak hesaplanır.
            
            Her 2 ip de ::/0 ise yine birbirlerini kapsadıkları için çakışma yüzdesi %100 olur.

            */

            // eğer gelen ip ::/0 ise parse direkt parse et
            const IPV6_START = ip6addr.parse("::");
            const IPV6_END = ip6addr.parse(
              "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"
            );

            let addr1_start, addr1_end, addr2_start, addr2_end;

            // item1 parsing
            if (item1FormattedIp === "::/0") {
              addr1_start = IPV6_START;
              addr1_end = IPV6_END;
            } else {
              // eğer gelen adres ipv4 ise ipv6 ya çevir

              // ipv4 adresler ip6addr ile parse edilemez, ipv6 olması gerekir
              const newIpv6ip = ipv4CidrToMappedIPv6Cidr(item1FormattedIp);
              const [ip, prefix] = newIpv6ip.split("/");
              const cidr = ip6addr.createCIDR(ip, parseInt(prefix));
              addr1_start = cidr.first();
              addr1_end = cidr.last(); // start'dan offsetBits kadar gidince sonunucu ip alınır
            }

            // item2 parsing
            if (item2.ipAdresi === "::/0") {
              addr2_start = IPV6_START;
              addr2_end = IPV6_END;
            } else {
              const newIpv6ip = ipv4CidrToMappedIPv6Cidr(item2FormattedIp);
              const [ip, prefix] = newIpv6ip.split("/");
              const cidr = ip6addr.createCIDR(ip, parseInt(prefix));
              addr2_start = cidr.first();
              addr2_end = cidr.last();
            }

            // Hangi ip'nin hangi ip'yi kapsadığı bilgileri bulunur ve ortak toplamın başlangıcı ve bitişi bulunur
            // .compare() dönen değer -1 ise ilk girilen küçük, 0 ise eşit, 1 ise ilk girilen büyüktür

            const ortakBaslangic =
              addr1_start.compare(addr2_start) > 0 ? addr1_start : addr2_start;
            const ortakBitis =
              addr1_end.compare(addr2_end) < 0 ? addr1_end : addr2_end;

            let ortakIpSayisi = 0;

            if (ortakBaslangic.compare(ortakBitis) <= 0) {
              ortakIpSayisi =
                BigInt(
                  "0x" +
                    ortakBitis
                      .toString({ format: "v6", zeroElide: false })
                      .replace(/:/g, "")
                ) -
                BigInt(
                  "0x" +
                    ortakBaslangic
                      .toString({ format: "v6", zeroElide: false })
                      .replace(/:/g, "")
                ) +
                1n;
            }

            // toplam ip sayıları
            const ipSayisi1 =
              BigInt(
                "0x" +
                  addr1_end
                    .toString({ format: "v6", zeroElide: false })
                    .replace(/:/g, "")
              ) -
              BigInt(
                "0x" +
                  addr1_start
                    .toString({ format: "v6", zeroElide: false })
                    .replace(/:/g, "")
              ) +
              1n;

            const ipSayisi2 =
              BigInt(
                "0x" +
                  addr2_end
                    .toString({ format: "v6", zeroElide: false })
                    .replace(/:/g, "")
              ) -
              BigInt(
                "0x" +
                  addr2_start
                    .toString({ format: "v6", zeroElide: false })
                    .replace(/:/g, "")
              ) +
              1n;

            const birlesimToplam = ipSayisi1 + ipSayisi2 - ortakIpSayisi;

            let yuzde = 0;
            if (birlesimToplam > 0n) {
              yuzde =
                Number((ortakIpSayisi * 10000000000n) / birlesimToplam) /
                100000000;
            }

            ortakIp = BigInt(ortakIpSayisi);
            ipSayisiRule1 = BigInt(ipSayisi1);
            ipSayisiRule2 = BigInt(ipSayisi2);

            conflictPertencageTotal = yuzde;
          } else {
            // normal formatta gelen adreslerin kontrolü
            const isFirstSmaller = altKumeKontroluIpV4(
              item1FormattedIp,
              item2FormattedIp
            );
            const isSecondSmaller = altKumeKontroluIpV4(
              item2FormattedIp,
              item1FormattedIp
            );

            console.log(
              `${item1FormattedIp} ⊂ ${item2FormattedIp} → ${isFirstSmaller}`
            );
            console.log(
              `${item2FormattedIp} ⊂ ${item1FormattedIp} → ${isSecondSmaller}`
            );

            const ortakIpSayisi = ortakIpSayisiIPv4(
              item1FormattedIp,
              item2FormattedIp
            );
            const item1ToplamIpSayisi = ipv4IpSayisi(item1FormattedIp);
            const item2ToplamIpSayisi = ipv4IpSayisi(item2FormattedIp);
            const toplamBirlesimIpSayisi =
              item1ToplamIpSayisi + item2ToplamIpSayisi - ortakIpSayisi;

            ortakIp = BigInt(ortakIpSayisi);
            ipSayisiRule1 = BigInt(item1ToplamIpSayisi);
            ipSayisiRule2 = BigInt(item2ToplamIpSayisi);

            conflictPertencageTotal = (
              (Number(ortakIpSayisi) / Number(toplamBirlesimIpSayisi)) *
              100
            ).toFixed(10);
          }
        } catch (errIp) {
          console.log("====> Çakışma kontrolü sırasında hata: ", errIp);
        }

        totalOrtakIp += ortakIp;
        totalRule1Ip += ipSayisiRule1;
        totalRule2Ip += ipSayisiRule2;

        conflictPertencagesList.push(conflictPertencageTotal);
      } /*  else {
        console.log("==== Kurallardan bir tanesinde ipAdresi bulunmuyor");
      } */
    });
  });

  let rule1EzilmeYuzdesi = 0;
  let rule2EzilmeYuzdesi = 0;

  if (totalOrtakIp > 0n) {
    rule1EzilmeYuzdesi = Number((totalOrtakIp * 10000n) / totalRule1Ip) / 100;
  }
  if (totalOrtakIp > 0n) {
    rule2EzilmeYuzdesi = Number((totalOrtakIp * 10000n) / totalRule2Ip) / 100;
  }

  let sonuc =
    `====> ${index1}. sıradaki kuralın %${rule1EzilmeYuzdesi.toFixed(
      3
    )} kadarı, ` +
    `${index2}. sıradaki kuralın %${rule2EzilmeYuzdesi.toFixed(
      3
    )} kadarını ezmektedir.`;

  console.log(sonuc);

  console.log("==== Analiz Sonu ---->");
  console.log("\n\n");

  return sonuc;
}

// 2 adres arasında hangisinin hangisinin alt kümesinde olduğu kontrolü
function altKumeKontroluIpV4(smallAdress, largeAdress) {
  // ilk girilen ile 2. girilen adreslerden hangisinin hangisini kapsadığını bulur

  const small = new CIDR(smallAdress);
  const large = new CIDR(largeAdress);

  // küçük CIDR'deki ilk IP adresi, büyük CIDR bloğuna ait mi?
  const firstIp = small.start();
  const lastIp = small.end();

  return large.contains(firstIp) && large.contains(lastIp);
}

// işi biten sql dosyasının kaldırılması
export function deleteSQLFile(filePath) {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.warn("===> File does not exist:", filePath);
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("===> File delete error:", err);
        return;
      }
      console.log("===> File deleted successfully");
    });
  });
}

// tekil ip adreslerini / içerecek şekilde formatla
function sonunaSubnetEkle(ip) {
  if (ip.includes("/")) return ip;
  return `${ip}/32`;
}

// IP string -> Long sayı dönüşümü
// sadece normal adres dönüşümleri için kullan
function ipToLong(ip) {
  if (typeof ip !== "string") {
    console.error("Geçersiz IP formatı, string bekleniyor:", ip);
    return 0n;
  }

  const octets = ip.split(".");
  if (octets.length !== 4) {
    console.error("Geçersiz IPv4 adresi:", ip);
    return 0n;
  }

  return octets.reduce(
    (acc, octet) => (acc << 8n) + BigInt(parseInt(octet, 10)),
    0n
  );
}

// IPv4 toplam IP sayısını al
function ipv4IpSayisi(cidrStr) {
  const cidr = new CIDR(cidrStr);
  return Number(cidr.size);
}

// IPv4 ortak IP sayısını hesapla
function ortakIpSayisiIPv4(ip1, ip2) {
  const cidr1 = new CIDR(ip1);
  const cidr2 = new CIDR(ip2);

  const start1 = ipToLong(cidr1.start());
  const end1 = ipToLong(cidr1.end());

  const start2 = ipToLong(cidr2.start());
  const end2 = ipToLong(cidr2.end());

  const ortakStart = start1 > start2 ? start1 : start2;
  const ortakEnd = end1 < end2 ? end1 : end2;

  const ortakSayisi = ortakEnd >= ortakStart ? ortakEnd - ortakStart + 1n : 0n;

  return Number(ortakSayisi);
}
