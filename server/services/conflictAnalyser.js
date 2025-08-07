import fs from "fs";
import CIDR from "ip-cidr";
import ip6addr from "ip6addr";
import net from "net";
import { Address6, Address4 } from "ip-address";

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



 Çakışma analizi algoritması ;
- Gelen veriler içerisinden adresler hariç tüm veriler en küçük parçalara ayrılacak, bu sayede oluşturulabilecek tüm kombinasyonlar 
için bir rule listesi olacak.
- adreslerin analizi 2 kural arasında çakışan ip sayısınının bulunması ile yapılacak. Her kuralın adres listesindeki her adres diğer 
kuralın adresleri ile karşılaştırılarak toplam çakışan ip sayısı bulunuacak. 
- adreslerin ve geriye kalan diğer verilerin çakışma yüzdeleri bulunduktan sonra bu 2 yüzde birbiri ile çarpılarak 2 kural arasındaki
toplam çakışma yüzdesi hesaplanmış olacak. 



*/

// portlar ve protokoller için tüm alt değerleri alma
function getSubData(rule) {
  const kaynak_ports = getSubKaynakPorts(rule.servisTanim_uyeleri);
  const hedef_ports = getSubHedefPorts(rule.servisTanim_uyeleri);
  const protokols = getSubProtokols(rule.servisler);
}

// 2 rule'daki kaynak adresleri alır ve bu adreslerin birbirleri ile % kaçlık çakışma olduğunu bulur
function calKaynakAdresConflict(rule1_kaynak_adresler, rule2_kaynak_adresler) {
  let toplam_conflict_ip_count = BigInt(0);
  let rule1_toplam_kaynak_adres_count = BigInt(0);
  let rule2_toplam_kaynak_adres_count = BigInt(0);

  // rule 1 adresleri
  let rule1_tam_adresler_ipv4 = [];
  let rule1_tam_adresler_ipv6 = [];
  rule1_kaynak_adresler.forEach((adres) => {
    const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
    if (checkIPVersion(tam_adres) == "IPv4") {
      rule1_tam_adresler_ipv4.push(tam_adres);
    } else if (checkIPVersion(tam_adres) == "IPv6") {
      rule1_tam_adresler_ipv6.push(tam_adres);
    } else {
      console.log("Geçersiz IP: ", adres);
    }
  });

  // rule 2 adresleri
  let rule2_tam_adresler_ipv4 = [];
  let rule2_tam_adresler_ipv6 = [];
  rule2_kaynak_adresler.forEach((adres) => {
    const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
    if (checkIPVersion(tam_adres) == "IPv4") {
      rule2_tam_adresler_ipv4.push(tam_adres);
    } else if (checkIPVersion(tam_adres) == "IPv6") {
      rule2_tam_adresler_ipv6.push(tam_adres);
    } else {
      console.log("Geçersiz IP: ", adres);
    }
  });

  //Oluşan adreslerin alt ip'lerinin sayısını çıkar

  //bir kurala birden fazla adrs girilebilir , her kuraldaki adresler diğer kuraldaki her adres ile teker teker
  // karşılaştırılır ve çakışan tüm ip sayıları toplanarak genel adres çakışma sayısı bulunur.

  // 2 adres arasında karşılaştırma yapılırken eğer adreslerin türleri farklı ise çakışma 0 olarak kabul edilir

  // Deneme Adresleri
  rule1_tam_adresler_ipv4 = [
    "10.0.0.0/15", // 131,072 IP (10.0.0.0 - 10.1.255.255)
    "192.168.0.0/22", // 1,024 IP (192.168.0.0 - 192.168.3.255)
    "172.16.0.0/16", // 65,536 IP (172.16.0.0 - 172.16.255.255)
  ];

  rule2_tam_adresler_ipv4 = [
    "10.0.128.0/17", // 32,768 IP (10.0.128.0 - 10.0.255.255) - rule1 içinde kısmi overlap
    "192.168.2.0/24", // 256 IP (192.168.2.0 - 192.168.2.255) - rule1 içinde tam kapsama
    "172.17.0.0/16", // 65,536 IP (172.17.0.0 - 172.17.255.255) - rule1 dışında, çakışmaz
    "8.8.8.0/24", // 256 IP (farklı blok, çakışmaz)
  ];

  /* rule1_tam_adresler_ipv6 = [
    "2001:db8::/64", // 2^64 IP (65,536 IP)
    "2001:db8:1::/64", // 2^64 IP (65,536 IP)
    "2001:db8:2::/63", // 2^(128-63)=2^65 IP (131,072 IP)
  ];

  rule2_tam_adresler_ipv6 = [
    "2001:db8::1/128", // Tek IP (1 IP), rule1'in ilk bloğunda
    "2001:db8:1::/64", // Tam çakışan blok (2^64 IP)
    "2001:db8:2::/64", // rule1'in 2::/63 bloğunun yarısı (2^64 IP)
  ]; */

  // Adreslerden toplam ip sayılarını çıkarma(ipv4)
  rule1_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule1_toplam_kaynak_adres_count += cidr.size;
  });

  rule2_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule2_toplam_kaynak_adres_count += cidr.size;
  });

  // Adreslerden toplam ip sayılarını çıkarma(ipv6)
  /* rule1_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule1_toplam_kaynak_adres_count += ip_count;
  });

  rule2_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule2_toplam_kaynak_adres_count += ip_count;
  }); */

  console.log(
    "====> Toplam rule1 adres sayısı : ",
    rule1_toplam_kaynak_adres_count
  );
  console.log(
    "====> Toplam rule2 adres sayısı : ",
    rule2_toplam_kaynak_adres_count
  );

  rule1_tam_adresler_ipv4.forEach((rule1_adres_v4) => {
    rule2_tam_adresler_ipv4.forEach((rule2_adres_v4) => {
      // gelen her adres çifti için ikisinde de bulunan ortak ip sayılarını hesapla

      try {
        const conflictIpCount = calculateConflictIpCountV4(
          rule1_adres_v4,
          rule2_adres_v4
        );
        toplam_conflict_ip_count += conflictIpCount;
      } catch (err) {
        console.error(
          "Karşılaştırma Sırasında Hata(IPV4):",
          err,
          rule1_adres_v4,
          rule2_adres_v4
        );
      }
    });
  });

  /* rule1_tam_adresler_ipv6.forEach((rule1_adres_v6) => {
    rule2_tam_adresler_ipv6.forEach((rule2_adres_v6) => {
      try {
        const conflictIpCount = calculateConflictIpCountV6(
          rule1_adres_v6,
          rule2_adres_v6
        );
        toplam_conflict_ip_count += conflictIpCount;
      } catch (err) {
        console.error(
          "Karşılaştırma Sırasında Hata(IPV6):",
          err,
          rule1_adres_v6,
          rule2_adres_v6
        );
      }
    });
  }); */

  console.log("Toplam çakışan ip sayısı : ", toplam_conflict_ip_count);
  console.log(
    "Toplam rule1 adres sayısı : ",
    Number(rule1_toplam_kaynak_adres_count)
  );
  console.log(
    "Toplam rule2 adres sayısı : ",
    Number(rule2_toplam_kaynak_adres_count)
  );

  // Yüzdelik hesaplama
  const rule1_conflict =
    Number(toplam_conflict_ip_count * BigInt(100)) /
    Number(rule1_toplam_kaynak_adres_count);
  const rule2_conflict =
    Number(toplam_conflict_ip_count * BigInt(100)) /
    Number(rule2_toplam_kaynak_adres_count);

  console.log(
    `1 kuralın %${rule1_conflict} kadarı, 2. kuralın %${rule2_conflict} kadarını ezmektedir.`
  );

  return toplam_conflict_ip_count;
}
function calHedefAdresConflict(rule1_hedef_adresler, rule2_hedef_adresler) {}

function getSubKaynakPorts(servisTanim_uyeler) {}
function getSubHedefPorts(servisTanim_uyeler) {}
function getSubProtokols(servisler) {}

function calculateConflictIpCountV4(adres1, adres2) {
  try {
    console.log(`\nAnaliz: ${adres1} ↔ ${adres2}`);

    // Address4 constructor'ı sadece string alıyor
    if (!Address4.isValid(adres1) || !Address4.isValid(adres2)) {
      console.log(`Geçersiz IPv4 adresi: ${adres1} veya ${adres2}`);
      return BigInt(0);
    }

    const addr1 = new Address4(adres1);
    const addr2 = new Address4(adres2);

    // startAddress() ve endAddress() metodları Address4 nesnesi döndürür
    const start1Addr = addr1.startAddress();
    const end1Addr = addr1.endAddress();
    const start2Addr = addr2.startAddress();
    const end2Addr = addr2.endAddress();

    // BigInteger değerlerini al
    const start1 = start1Addr.bigInt();
    const end1 = end1Addr.bigInt();
    const start2 = start2Addr.bigInt();
    const end2 = end2Addr.bigInt();

    console.log(`Range1: ${start1Addr.address} - ${end1Addr.address}`);
    console.log(`Range2: ${start2Addr.address} - ${end2Addr.address}`);
    console.log(`Range1 BigInt: ${start1} - ${end1}`);
    console.log(`Range2 BigInt: ${start2} - ${end2}`);

    // Kesişim kontrolü
    if (end1 < start2 || end2 < start1) {
      console.log(`Kesişim YOK → 0 IP`);
      return BigInt(0);
    }

    // Kesişim aralığını hesapla
    const startOverlap = start1 > start2 ? start1 : start2;
    const endOverlap = end1 < end2 ? end1 : end2;
    const overlapCount = endOverlap - startOverlap + BigInt(1);

    // Debug için kesişim adreslerini göster
    try {
      const startOverlapAddr = Address4.fromBigInt(startOverlap);
      const endOverlapAddr = Address4.fromBigInt(endOverlap);
      console.log(
        `Kesişim: ${startOverlapAddr.address} - ${endOverlapAddr.address}`
      );
    } catch (e) {
      console.log(`Kesişim BigInt aralığı: ${startOverlap} - ${endOverlap}`);
    }

    console.log(`Çakışma → ${overlapCount} IP`);
    return overlapCount;
  } catch (err) {
    console.error("ip-address paketi hatası:", err.message);
    console.error("Hatalı adresler:", adres1, adres2);
    return BigInt(0);
  }
}

// Düzeltilmiş IPv6 çakışma hesaplama fonksiyonu
function calculateConflictIpCountV6(adres1, adres2) {
  try {
    console.log(`\nAnaliz: ${adres1} ↔ ${adres2}`);

    // Address6 constructor'ı sadece string alıyor
    if (!Address6.isValid(adres1) || !Address6.isValid(adres2)) {
      console.log(`Geçersiz IPv6 adresi: ${adres1} veya ${adres2}`);
      return BigInt(0);
    }

    const addr1 = new Address6(adres1);
    const addr2 = new Address6(adres2);

    // startAddress() ve endAddress() metodları Address6 nesnesi döndürür
    const start1Addr = addr1.startAddress();
    const end1Addr = addr1.endAddress();
    const start2Addr = addr2.startAddress();
    const end2Addr = addr2.endAddress();

    // BigInteger değerlerini al
    const start1 = start1Addr.bigInt();
    const end1 = end1Addr.bigInt();
    const start2 = start2Addr.bigInt();
    const end2 = end2Addr.bigInt();

    console.log(`Range1: ${start1Addr.address} - ${end1Addr.address}`);
    console.log(`Range2: ${start2Addr.address} - ${end2Addr.address}`);
    console.log(`Range1 BigInt: ${start1} - ${end1}`);
    console.log(`Range2 BigInt: ${start2} - ${end2}`);

    // Kesişim kontrolü
    if (end1 < start2 || end2 < start1) {
      console.log(`Kesişim YOK → 0 IP`);
      return BigInt(0);
    }

    // Kesişim aralığını hesapla
    const startOverlap = start1 > start2 ? start1 : start2;
    const endOverlap = end1 < end2 ? end1 : end2;

    const overlapCount = endOverlap - startOverlap + BigInt(1);

    // Debug için kesişim adreslerini göster
    try {
      const startOverlapAddr = Address6.fromBigInt(startOverlap);
      const endOverlapAddr = Address6.fromBigInt(endOverlap);
      console.log(
        `Kesişim: ${startOverlapAddr.address} - ${endOverlapAddr.address}`
      );
    } catch (e) {
      console.log(`Kesişim BigInt aralığı: ${startOverlap} - ${endOverlap}`);
    }

    console.log(`Çakışma → ${overlapCount} IP`);
    return overlapCount;
  } catch (err) {
    console.error("ip-address paketi hatası:", err.message);
    console.error("Hatalı adresler:", adres1, adres2);
    return BigInt(0);
  }
}

// ip versiyonunu bulur => (IPv4-IPv6), input olarak subnet bilgisi olmadan adres girilmeli
function checkIPVersion(ip) {
  const base_ip = ip.split("/")[0];
  if (net.isIPv4(base_ip)) {
    return "IPv4";
  } else if (net.isIPv6(base_ip)) {
    return "IPv6";
  } else {
    return "Geçersiz IP";
  }
}

// alınan ipv6 adresindeki toplam ip sayısın bulur
function getIpv6AddrIpCount(cidrStr) {
  try {
    if (!Address6.isValid(cidrStr)) {
      console.log(`Geçersiz IPv6 CIDR: ${cidrStr}`);
      return BigInt(0);
    }

    const address = new Address6(cidrStr);
    const hostBits = 128 - address.subnetMask;
    const ipCount = BigInt(1) << BigInt(hostBits);

    console.log(
      `====> CIDR: ${cidrStr}, Prefix: /${address.subnetMask}, IP count: ${ipCount}`
    );
    return ipCount;
  } catch (err) {
    console.error("IP sayısı hesaplama hatası:", err.message, cidrStr);
    return BigInt(0);
  }
}

// girilen ip6addr objesini bigInt a çevirir
function ipv6ToBigInt(addr) {
  try {
    // IPv6 adresini tam format olarak al (sıfır padding ile)
    const hex = addr
      .toString({ format: "v6", zeroPad: true })
      .replace(/:/g, "");
    return BigInt("0x" + hex);
  } catch (err) {
    console.error("IPv6 BigInt dönüştürme hatası:", err);
    return BigInt(0);
  }
}

// ip'yi sayıya dönüştürme
function ipToLong(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function testIPv6Conflicts() {
  console.log("=== IPv6 Çakışma Testi ===");

  const testCases = [
    {
      addr1: "2001:db8:abcd::/122", // 64 IP (0-63)
      addr2: "2001:db8:abcd::20/125", // 8 IP (32-39)
      expected: 8, // Tam kesişim: ::20-::27 (8 IP)
    },
    {
      addr1: "fd00:1234::/124", // 16 IP (0-15)
      addr2: "fd00:1234::4/128", // 1 IP (4)
      expected: 1, // Tam kesişim: ::4
    },
    {
      addr1: "fd00:aaaa::/125", // 8 IP (0-7)
      addr2: "fd00:aaaa::6/128", // 1 IP (6)
      expected: 1, // Tam kesişim: ::6
    },
    {
      addr1: "2001:db8:beef::/127", // 2 IP (0-1)
      addr2: "2001:db8:beef::/126", // 4 IP (0-3)
      expected: 2, // Tam kesişim: ::0-::1
    },
    {
      addr1: "fe80::1:2/128", // 1 IP
      addr2: "fe80::1:2/128", // 1 IP (aynı)
      expected: 1, // Tam kesişim
    },
    {
      addr1: "2001:db8:beef::/127", // Farklı ağ ailesi
      addr2: "fd00:1234::4/128",
      expected: 0, // Kesişim olmamalı
    },
  ];

  testCases.forEach((test, index) => {
    console.log(`\n--- Test ${index + 1} ---`);
    console.log(`Adres 1: ${test.addr1}`);
    console.log(`Adres 2: ${test.addr2}`);
    console.log(`Beklenen: ${test.expected} IP`);

    const result = calculateConflictIpCountV6(test.addr1, test.addr2);
    const resultNum = Number(result);

    console.log(`Hesaplanan: ${resultNum} IP`);
    console.log(
      `Sonuç: ${resultNum === test.expected ? "✅ DOĞRU" : "❌ HATALI"}`
    );
  });
}

function testProblematicCases() {
  console.log("=== PROBLEMATİK DURUMLARIN TESTİ ===");

  const tests = [
    {
      name: "Test 1: 2001:db8:abcd aralığı",
      addr1: "2001:db8:abcd::/122",
      addr2: "2001:db8:abcd::20/125",
      expected: 8,
    },
    {
      name: "Test 2: 2001:db8:beef aralığı",
      addr1: "2001:db8:beef::/127",
      addr2: "2001:db8:beef::/126",
      expected: 2,
    },
  ];

  tests.forEach((test) => {
    console.log(`\n${test.name}`);
    console.log(`Beklenen: ${test.expected} IP`);

    const result = calculateConflictIpCountV6(test.addr1, test.addr2);
    const resultNum = Number(result);

    console.log(
      `Sonuç: ${resultNum === test.expected ? "✅ DOĞRU" : "❌ HATALI"}`
    );
  });
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
  testProblematicCases();

  // tüm kuralları birbirleri ile 2 kural sadece bir kere analiz edilecek şekilde analize sok

  let analysises = [];

  // döngü içindeki her rule analiz edilmeden önce alt verileri çıkarılacağı için tekrar tekrar aynı verileri çıkarmak yerine
  // her çıkarıldığında bir listede tut, eğer bir kural tekrar istenirse alt verileri listeden al
  let rule_subData = [];

  for (let i = 0; i < rules.length; i++) {
    const rule1 = rules[i];

    console.log(
      "Toplam çakışan ip sayısı : ",
      calKaynakAdresConflict(rule1.kaynakAdresleri, rule1.kaynakAdresleri)
    );

    // 2. rule seçilecek zaman her zaman birincidekinden sonraki rule lar arasından bir tanesi seçilecek
    for (let j = i + 1; j < rules.length; j++) {
      const rule2 = rules[j];

      // Her 2 farklı kuralın analizini yap, sonucu analysis listesinde tut
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
/* function ipToLong(ip) {
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
} */

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
