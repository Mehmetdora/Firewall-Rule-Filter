import fs from "fs";
import CIDR from "ip-cidr";
import ip6addr from "ip6addr";
import net from "net";
import { Address6, Address4 } from "ip-address";
import { log } from "console";

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

  // tüm kuralları birbirleri ile 2 kural sadece bir kere analiz edilecek şekilde analize sok

  let analysises = [];

  let rule_subData = [];

  for (let i = 0; i < rules.length; i++) {
    const rule1 = rules[i];

    // 2. rule seçilecek zaman her zaman birincidekinden sonraki rule lar arasından bir tanesi seçilecek
    for (let j = i + 1; j < rules.length; j++) {
      const rule2 = rules[j];

      // Her 2 farklı kuralın analizini yap, sonucu analysis listesinde tut

      // başlangıçta toplam çakıma 1 olsun , yeni bir çakışma hesaplanınca bu değer ile çarpılacak
      // eğer yeni çakışma 0 çıkarsa hesaba katılmayacak
      let first_rule_total_conflict = 1.0;
      let second_rule_total_conflict = 1.0;

      // eğer 2 kuraldan herhangi birinde kaynak adres yada hedef adres değeri yoksa çakışma olmayacak demektir
      // eğer girilen adresler için hariç seçeneği true ise bulununa oranı tersine çevir

      // tüm çakışma sonuçları birbirleri ile çarpılmalı , eğer içinden bir tanesi 0 ise çakışma yoktur
      if (
        rule1.kaynakAdresleri.length != 0 &&
        rule2.kaynakAdresleri.length != 0
      ) {
        // gelen değer tam sayı %55 gibi, bunu kesirli halde kullan
        const { rule1_conflict, rule2_conflict } = calKaynakAdresConflict(
          rule1.kaynakAdresleri,
          rule2.kaynakAdresleri
        );
        console.log(
          "#####--- Kaynak adres çakışmaları sonucu: ",
          rule1_conflict,
          " - ",
          rule2_conflict
        );

        let rule1_conflict_value = rule1_conflict;
        let rule2_conflict_value = rule2_conflict;

        let rule1_conflict_fraction = rule1_conflict_value / 100.0;
        let rule2_conflict_fraction = rule2_conflict_value / 100.0;

        // Eğer hariç tut seçeneği işaretlenmiş ise yüzdeleri tersine çevir
        if (rule1.detaylar.kaynakAdresHaricTut == true) {
          rule1_conflict_fraction = (100.0 - rule1_conflict_value) / 100.0;
        }
        if (rule2.detaylar.kaynakAdresHaricTut == true) {
          rule2_conflict_fraction = (100.0 - rule2_conflict_value) / 100.0;
        }

        first_rule_total_conflict *= rule1_conflict_fraction;
        second_rule_total_conflict *= rule2_conflict_fraction;

        console.log(
          "#####--- Kaynak adres yüzdelerinin genel yüzdeler ile çarpılması sonucu: ",
          first_rule_total_conflict,
          " - ",
          second_rule_total_conflict
        );
      }

      if (
        rule1.hedefAdresleri.length != 0 &&
        rule2.hedefAdresleri.length != 0
      ) {
        const { rule1_conflict, rule2_conflict } = calHedefAdresConflict(
          rule1.hedefAdresleri,
          rule2.hedefAdresleri
        );

        console.log(
          "#####--- Hedef adreslerinin çakışmaları: ",
          rule1_conflict,
          " - ",
          rule2_conflict
        );

        let rule1_conflict_value = rule1_conflict;
        let rule2_conflict_value = rule2_conflict;

        let rule1_conflict_fraction = rule1_conflict_value / 100.0;
        let rule2_conflict_fraction = rule2_conflict_value / 100.0;

        // Eğer hariç tut seçeneği işaretlenmiş ise yüzdeleri tersine çevir
        if (rule1.detaylar.hedefAdresHaricTut == true) {
          rule1_conflict_fraction = (100.0 - rule1_conflict_value) / 100.0;
        }
        if (rule2.detaylar.kaynakAdresHaricTut == true) {
          rule2_conflict_fraction = (100.0 - rule2_conflict_value) / 100.0;
        }

        //  genel yüzdeye ekle
        first_rule_total_conflict *= rule1_conflict_fraction;
        second_rule_total_conflict *= rule2_conflict_fraction;

        console.log(
          "#####--- Hedef adres yüzdelerinin genel yüzdeler ile çarpılması sonucu: ",
          first_rule_total_conflict,
          " - ",
          second_rule_total_conflict
        );
      }

      // alt verileri kaşılaştır, çakışma oranı bul, genel oran ile birleştir

      try {
        const rule1_sub_data = getSubData(rule1);
        const rule2_sub_data = getSubData(rule2);

        let rule1_sub_datas = [
          ...rule1_sub_data.kaynak_ports,
          ...rule1_sub_data.hedef_ports,
          ...rule1_sub_data.protokoller,
        ];
        let rule2_sub_datas = [
          ...rule2_sub_data.kaynak_ports,
          ...rule2_sub_data.hedef_ports,
          ...rule2_sub_data.protokoller,
        ];

        // eğer her 2 kuralda da veri varsa çakışmayı hesapla ve genel yüzde ile çarp
        // sadece birinde veya her ikisinde de veri yoksa çakışma yok demektir
        if (rule1_sub_datas.length != 0 && rule2_sub_datas.length != 0) {
          const rule1_sub_data_list = createSubDataList(
            rule1_sub_data.kaynak_ports,
            rule1_sub_data.hedef_ports,
            rule1_sub_data.protokoller
          );
          const rule2_sub_data_list = createSubDataList(
            rule2_sub_data.kaynak_ports,
            rule2_sub_data.hedef_ports,
            rule2_sub_data.protokoller
          );

          const rule1_sub_data_set = new Set(rule1_sub_data_list);
          const rule2_sub_data_set = new Set(rule2_sub_data_list);

          const rule1_sub_data_set_list = Array.from(rule1_sub_data_set);
          const rule2_sub_data_set_list = Array.from(rule2_sub_data_set);

          const ortak_data = rule1_sub_data_set_list.filter((item) =>
            rule2_sub_data_set_list.includes(item)
          );

          console.log("###---> Ortak data: ", ortak_data);

          const rule1_sub_data_conflict =
            ortak_data.length / rule1_sub_data_set_list.length;
          const rule2_sub_data_conflict =
            ortak_data.length / rule2_sub_data_set_list.length;

          console.log("====> Ortak portlar-protokoller: ", ortak_data);
          console.log(
            "====> Rule1 Port-Protokolleri çakışma oranı: ",
            rule1_sub_data_conflict
          );
          console.log(
            "====> Rule2 Port-Protokolleri çakışma oranı: ",
            rule2_sub_data_conflict
          );

          first_rule_total_conflict *= rule1_sub_data_conflict;
          second_rule_total_conflict *= rule2_sub_data_conflict;

          console.log(
            "####---> Sub data genel çakışmalara eklendikten sonra : ",
            first_rule_total_conflict,
            " - ",
            second_rule_total_conflict
          );
        }
      } catch (err) {
        console.log(
          "Port-protokollerinin çakışma hesabı sırasında hata: ",
          err
        );
      }

      // genel yüzdeler tam sayı ise tam sayı olarak göster
      // eğer çakışma tam sayı değilse virgülden sonrasını 8 basamağa yuvarlar-göster
      // eğer virgüllü şekilde yine 0 ise tam sayı olarak 0 yap
      let first_conflict_percentage =
        (first_rule_total_conflict * 100.0) % 1 === 0
          ? (first_rule_total_conflict * 100.0).toString()
          : (first_rule_total_conflict * 100.0).toFixed(8);

      let second_conflict_percentage =
        (second_rule_total_conflict * 100.0) % 1 === 0
          ? (second_rule_total_conflict * 100.0).toString()
          : (second_rule_total_conflict * 100.0).toFixed(8);

      first_conflict_percentage =
        first_conflict_percentage == 0.0 ? 0 : first_conflict_percentage;
      second_conflict_percentage =
        second_conflict_percentage == 0.0 ? 0 : second_conflict_percentage;

      const analiz = {
        rule1_id: rule1.id,
        rule2_id: rule2.id,
        rule1_grup_no: rule1.grup_sira_no,
        rule2_grup_no: rule2.grup_sira_no,
        rule1_sira_no: rule1.sira_no,
        rule2_sira_no: rule2.sira_no,
        rule1_aciklama: rule1.aciklama,
        rule2_aciklama: rule2.aciklama,
        rule1_conflict: first_conflict_percentage,
        rule2_conflict: second_conflict_percentage,
      };
      console.log("Gönderilen analiz:", analiz);

      console.log(
        "####---> En son genel çakışma yüzdeleri(her şey dahil): ",
        first_rule_total_conflict,
        " - ",
        second_rule_total_conflict,
        "\n\n"
      );

      analysises.push(analiz);
    }
  }

  console.log("\n==== Analiz Tamamlandı.");
  console.log("Toplam rule sayısı: ", rules.length);
  console.log(
    "Olması gereken analiz sayısı: ",
    (rules.length * (rules.length - 1)) / 2
  );
  console.log("Toplam analiz sayısı:", analysises.length);

  return analysises;
}


// portlar ve protokoller için tüm alt değerleri alma
function getSubData(rule) {
  const kaynak_ports_list = getSubKaynakPorts(rule.servisTanim_uyeleri);
  const hedef_ports_list = getSubHedefPorts(rule.servisTanim_uyeleri);
  const protokols_list = getSubProtokols(rule.servisler);

  return {
    kaynak_ports: kaynak_ports_list,
    hedef_ports: hedef_ports_list,
    protokoller: protokols_list,
  };
}

// gelen verileri kartezyen çarpım kullanarak tüm kombinasyonlarını oluştur
function createSubDataList(kaynak_ports, hedef_ports, protokoller) {
  let sub_datas = [];

  // eğer bir değer yoksa diğerlerini kullanarak alt veri oluştur
  if (kaynak_ports.length != 0) {
    kaynak_ports.forEach((kaynak_port) => {
      if (hedef_ports.length != 0) {
        hedef_ports.forEach((hedef_port) => {
          if (protokoller.length != 0) {
            protokoller.forEach((protokol) => {
              const sub_data = `${kaynak_port}-${hedef_port}-${protokol}`;
              sub_datas.push(sub_data);
            });
          } else {
            const sub_data = `${kaynak_port}-${hedef_port}`;
            sub_datas.push(sub_data);
          }
        });
      } else {
        if (protokoller.length != 0) {
          protokoller.forEach((protokol) => {
            const sub_data = `${kaynak_port}-${protokol}`;
            sub_datas.push(sub_data);
          });
        } else {
          const sub_data = `${kaynak_port}`;
          sub_datas.push(sub_data);
        }
      }
    });
  } else {
    // kaynak_ports yoksa
    if (hedef_ports.length != 0) {
      hedef_ports.forEach((hedef_port) => {
        if (protokoller.length != 0) {
          protokoller.forEach((protokol) => {
            const sub_data = `${hedef_port}-${protokol}`;
            sub_datas.push(sub_data);
          });
        } else {
          const sub_data = `${hedef_port}`;
          sub_datas.push(sub_data);
        }
      });
    } else {
      // sadece protokoller varsa
      if (protokoller.length != 0) {
        protokoller.forEach((protokol) => {
          const sub_data = `${protokol}`;
          sub_datas.push(sub_data);
        });
      }
    }
  }

  return sub_datas;
}

// servisTanim_uyeler tablosundaki her kayıttan port bilgilerini alır ve liste olarak tüm portları verir
function getSubKaynakPorts(servisTanim_uyeler) {
  let ports = new Set(); // sadece benzersiz olan portlar
  servisTanim_uyeler.forEach((servisTanim) => {
    const port_baslangic = servisTanim.kaynakPortBaslangic;
    const port_bitis = servisTanim.kaynakPortBitis;

    if (port_baslangic || port_bitis) {
      for (let port = port_baslangic; port <= port_bitis; port++) {
        ports.add(port);
      }
    }
  });

  ports = Array.from(ports);

  console.log("===> Kaynak ports: ", ports);
  return ports;
}
function getSubHedefPorts(servisTanim_uyeler) {
  let ports = new Set();
  servisTanim_uyeler.forEach((servisTanim) => {
    const port_baslangic = servisTanim.hedefPortBaslangic;
    const port_bitis = servisTanim.hedefPortBitis;

    if (port_baslangic || port_bitis) {
      for (let port = port_baslangic; port <= port_bitis; port++) {
        ports.add(port);
      }
    }
  });

  ports = Array.from(ports);

  console.log("===> Hedef ports: ", ports);
  return ports;
}
function getSubProtokols(servisler) {
  let protokoller = new Set();

  servisler.forEach((protokol) => {
    protokoller.add(protokol.adi);
  });

  protokoller = Array.from(protokoller);
  console.log("===> protokollerr: ", protokoller);

  return protokoller;
}

// 2 rule'daki kaynak adresleri alır ve bu adreslerin birbirleri ile % kaçlık çakışma olduğunu bulur
// 2 kural için çakışma yüzdeleri çıktısını verir(kaynak adres)
function calKaynakAdresConflict(rule1_kaynak_adresler, rule2_kaynak_adresler) {
  // Sonuçların hepsi big int olsun ki büyük sayılarda hata çıkmasın
  let toplam_conflict_ip_count = BigInt(0);
  let rule1_toplam_kaynak_adres_count = BigInt(0);
  let rule2_toplam_kaynak_adres_count = BigInt(0);

  // rule 1 adreslerini grupla
  let rule1_tam_adresler_ipv4 = [];
  let rule1_tam_adresler_ipv6 = [];
  rule1_kaynak_adresler.forEach((adres) => {
    if (adres.ipAdresi) {
      const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
      if (checkIPVersion(tam_adres) == "IPv4") {
        rule1_tam_adresler_ipv4.push(tam_adres);
      } else if (checkIPVersion(tam_adres) == "IPv6") {
        rule1_tam_adresler_ipv6.push(tam_adres);
      } else {
        console.log("Geçersiz IP: ", adres);
      }
    } else {
      console.log("===> İp Adresi bulunmuyor: ", adres);
    }
  });

  // rule 2 adreslerini grupla
  let rule2_tam_adresler_ipv4 = [];
  let rule2_tam_adresler_ipv6 = [];
  rule2_kaynak_adresler.forEach((adres) => {
    if (adres.ipAdresi) {
      const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
      if (checkIPVersion(tam_adres) == "IPv4") {
        rule2_tam_adresler_ipv4.push(tam_adres);
      } else if (checkIPVersion(tam_adres) == "IPv6") {
        rule2_tam_adresler_ipv6.push(tam_adres);
      } else {
        console.log("Geçersiz IP: ", adres);
      }
    } else {
      console.log("İp Adresi bulunmuyor: ", adres);
    }
  });

  //Oluşan adreslerin alt ip'lerinin sayısını çıkar

  //bir kurala birden fazla adrs girilebilir , her kuraldaki adresler diğer kuraldaki her adres ile teker teker
  // karşılaştırılır ve çakışan tüm ip sayıları toplanarak toplam çakışan ip sayısı bulunur.

  // 2 adres arasında karşılaştırma yapılırken eğer adreslerin türleri farklı ise çakışma 0 olarak kabul edilir,
  // yani ipv4 kendi içlerinde , ipv6 kendi içlerinde analiz edilecek

  // Adreslerden toplam ip sayılarını çıkar(ipv4)
  rule1_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule1_toplam_kaynak_adres_count += cidr.size;
  });

  rule2_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule2_toplam_kaynak_adres_count += cidr.size;
  });

  // Adreslerden toplam ip sayılarını çıkar(ipv6)
  rule1_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule1_toplam_kaynak_adres_count += ip_count;
  });

  rule2_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule2_toplam_kaynak_adres_count += ip_count;
  });

  // İlk kuralın adreslerini 2. kuralın adresleri ile karşılaştır ve her karşılaştırmada çakışan ip sayısını al

  rule1_tam_adresler_ipv4.forEach((rule1_adres_v4) => {
    rule2_tam_adresler_ipv4.forEach((rule2_adres_v4) => {
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

  rule1_tam_adresler_ipv6.forEach((rule1_adres_v6) => {
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
  });

  // Yüzdelik hesaplama- virgülden sonra 3 basamak al
  const rule1_conflict = (
    Number(toplam_conflict_ip_count * BigInt(100)) /
    Number(rule1_toplam_kaynak_adres_count)
  ).toFixed(3);
  const rule2_conflict = (
    Number(toplam_conflict_ip_count * BigInt(100)) /
    Number(rule2_toplam_kaynak_adres_count)
  ).toFixed(3);

  return { rule1_conflict: rule1_conflict, rule2_conflict: rule2_conflict };
}
function calHedefAdresConflict(rule1_hedef_adresler, rule2_hedef_adresler) {
  // Sonuçların hepsi big int olsun ki büyük sayılarda hata çıkmasın
  let toplam_conflict_ip_count = BigInt(0);
  let rule1_toplam_hedef_adres_count = BigInt(0);
  let rule2_toplam_hedef_adres_count = BigInt(0);

  // rule 1 adreslerini grupla
  let rule1_tam_adresler_ipv4 = [];
  let rule1_tam_adresler_ipv6 = [];
  rule1_hedef_adresler.forEach((adres) => {
    if (adres.ipAdresi) {
      const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
      if (checkIPVersion(tam_adres) == "IPv4") {
        rule1_tam_adresler_ipv4.push(tam_adres);
      } else if (checkIPVersion(tam_adres) == "IPv6") {
        rule1_tam_adresler_ipv6.push(tam_adres);
      } else {
        console.log("Geçersiz IP: ", adres);
      }
    } else {
      console.log("İp Adresi Bulunmuyor: ", adres);
    }
  });

  // rule 2 adreslerini grupla
  let rule2_tam_adresler_ipv4 = [];
  let rule2_tam_adresler_ipv6 = [];
  rule2_hedef_adresler.forEach((adres) => {
    if (adres.ipAdresi) {
      const tam_adres = sonunaSubnetEkle(adres.ipAdresi);
      if (checkIPVersion(tam_adres) == "IPv4") {
        rule2_tam_adresler_ipv4.push(tam_adres);
      } else if (checkIPVersion(tam_adres) == "IPv6") {
        rule2_tam_adresler_ipv6.push(tam_adres);
      } else {
        console.log("Geçersiz IP: ", adres);
      }
    } else {
      console.log("İp Adresi Bulunmuyor: ", adres);
    }
  });

  //Oluşan adreslerin alt ip'lerinin sayısını çıkar

  //bir kurala birden fazla adrs girilebilir , her kuraldaki adresler diğer kuraldaki her adres ile teker teker
  // karşılaştırılır ve çakışan tüm ip sayıları toplanarak toplam çakışan ip sayısı bulunur.

  // 2 adres arasında karşılaştırma yapılırken eğer adreslerin türleri farklı ise çakışma 0 olarak kabul edilir,
  // yani ipv4 kendi içlerinde , ipv6 kendi içlerinde analiz edilecek
  // Adreslerden toplam ip sayılarını çıkar(ipv4)
  rule1_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule1_toplam_hedef_adres_count += cidr.size;
  });

  rule2_tam_adresler_ipv4.forEach((item) => {
    const cidr = new CIDR(item);
    rule2_toplam_hedef_adres_count += cidr.size;
  });

  // Adreslerden toplam ip sayılarını çıkar(ipv6)
  rule1_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule1_toplam_hedef_adres_count += ip_count;
  });

  rule2_tam_adresler_ipv6.forEach((item) => {
    const ip_count = getIpv6AddrIpCount(item);
    rule2_toplam_hedef_adres_count += ip_count;
  });

  // İlk kuralın adreslerini 2. kuralın adresleri ile karşılaştır ve her karşılaştırmada çakışan ip sayısını al

  rule1_tam_adresler_ipv4.forEach((rule1_adres_v4) => {
    rule2_tam_adresler_ipv4.forEach((rule2_adres_v4) => {
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

  rule1_tam_adresler_ipv6.forEach((rule1_adres_v6) => {
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
  });

  // Yüzdelik hesaplama
  const rule1_conflict = Number(
    Number(toplam_conflict_ip_count * BigInt(100)) /
      Number(rule1_toplam_hedef_adres_count)
  ).toFixed(8);
  const rule2_conflict = Number(
    Number(toplam_conflict_ip_count * BigInt(100)) /
      Number(rule2_toplam_hedef_adres_count)
  ).toFixed(8);

  return { rule1_conflict: rule1_conflict, rule2_conflict: rule2_conflict };
}

function calculateConflictIpCountV4(adres1, adres2) {
  try {
    // Address4 constructor sadece string alıyor
    if (!Address4.isValid(adres1) || !Address4.isValid(adres2)) {
      console.log(`Geçersiz IPv4 adresi: ${adres1} veya ${adres2}`);
      return BigInt(0);
    }

    const addr1 = new Address4(adres1);
    const addr2 = new Address4(adres2);

    // ilk ve son adres ip lerini al
    const start1Addr = addr1.startAddress();
    const end1Addr = addr1.endAddress();
    const start2Addr = addr2.startAddress();
    const end2Addr = addr2.endAddress();

    // bu değerleri sayısal olarak ifade et , karşılaştırma için
    const start1 = start1Addr.bigInt();
    const end1 = end1Addr.bigInt();
    const start2 = start2Addr.bigInt();
    const end2 = end2Addr.bigInt();

    // Kesişim kontrolü
    if (end1 < start2 || end2 < start1) {
      return BigInt(0);
    }

    // Kesişim ip sayını hesaplama
    const startOverlap = start1 > start2 ? start1 : start2;
    const endOverlap = end1 < end2 ? end1 : end2;
    const overlapCount = endOverlap - startOverlap + BigInt(1);

    return overlapCount;
  } catch (err) {
    console.error("ip-address paketi hatası:", err.message);
    console.error("Hatalı adresler:", adres1, adres2);
    return BigInt(0);
  }
}

function calculateConflictIpCountV6(adres1, adres2) {
  try {
    // Address6 constructor sadece string alıyor
    if (!Address6.isValid(adres1) || !Address6.isValid(adres2)) {
      console.log(`Geçersiz IPv6 adresi: ${adres1} veya ${adres2}`);
      return BigInt(0);
    }

    const addr1 = new Address6(adres1);
    const addr2 = new Address6(adres2);

    const start1Addr = addr1.startAddress();
    const end1Addr = addr1.endAddress();
    const start2Addr = addr2.startAddress();
    const end2Addr = addr2.endAddress();

    const start1 = start1Addr.bigInt();
    const end1 = end1Addr.bigInt();
    const start2 = start2Addr.bigInt();
    const end2 = end2Addr.bigInt();

    // Kesişim yoksa eğer
    if (end1 < start2 || end2 < start1) {
      return BigInt(0);
    }

    // Kesişim aralığını hesapla
    const startOverlap = start1 > start2 ? start1 : start2;
    const endOverlap = end1 < end2 ? end1 : end2;
    const overlapCount = endOverlap - startOverlap + BigInt(1);

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

    return ipCount;
  } catch (err) {
    console.error("IP sayısı hesaplama hatası:", err.message, cidrStr);
    return BigInt(0);
  }
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

// IPv4 toplam IP sayısını al
function ipv4IpSayisi(cidrStr) {
  const cidr = new CIDR(cidrStr);
  return Number(cidr.size);
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
