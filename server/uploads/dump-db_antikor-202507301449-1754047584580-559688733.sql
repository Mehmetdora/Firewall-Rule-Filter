--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

-- Started on 2025-07-30 14:49:31 +03
DROP TABLE IF exist public."tb_guvenlikKurallari";

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 708 (class 1259 OID 52839)
-- Name: tb_guvenlikKurallari; Type: TABLE; Schema: public; Owner: usr_antikor
--

CREATE TABLE public."tb_guvenlikKurallari" (
    id character varying DEFAULT public.fn_gen_uid() NOT NULL,
    durum_id smallint NOT NULL,
    "siraNo" integer DEFAULT 1 NOT NULL,
    islem_id smallint NOT NULL,
    "kaynakAdres" jsonb NOT NULL,
    "hedefAdres" jsonb NOT NULL,
    statefull boolean NOT NULL,
    aciklama character varying NOT NULL,
    detaylar jsonb,
    ayarlar jsonb,
    "maxBaglantiSayisi" smallint,
    "besSaniyedeMaxBaglantiSayisi" smallint,
    merkez_profil_id integer,
    "trafigiLogla" boolean DEFAULT false,
    "agGecidi_id" character varying,
    olusturma_tarihi timestamp with time zone DEFAULT now() NOT NULL,
    guncelleme_tarihi timestamp with time zone DEFAULT now() NOT NULL,
    olusturma_kullanici character varying,
    guncelleme_kullanici character varying,
    paket_id character varying,
    "paketModu" public."guvenlikKuraliPaketiModu" DEFAULT 'routing'::public."guvenlikKuraliPaketiModu",
    konfig_id integer DEFAULT COALESCE((current_setting('antikor.konfig_id'::text, true))::integer, 0) NOT NULL,
    global_konfig_id integer DEFAULT COALESCE((current_setting('antikor.global_konfig_id'::text, true))::integer, 0) NOT NULL,
    nat public.nat,
    "natHavuzu_id" uuid,
    "webFilter" boolean DEFAULT false NOT NULL,
    "webFilter_profil_id" character varying,
    antivirus boolean DEFAULT false NOT NULL,
    antivirus_profil_id uuid,
    "dnsFilter" boolean DEFAULT false NOT NULL,
    "dnsFilter_profil_id" character varying,
    "uygulamaKontrol" boolean DEFAULT false NOT NULL,
    "uygulamaKontrol_profil_id" character varying,
    ips boolean DEFAULT false NOT NULL,
    ips_profil_id character varying,
    ratelimit boolean DEFAULT false NOT NULL,
    ratelimit_profil_id uuid,
    "sshDenetimi" boolean DEFAULT false NOT NULL,
    "sshDenetimi_profil_id" character varying,
    waf boolean DEFAULT false NOT NULL,
    waf_profil_id uuid,
    grup_id character varying NOT NULL,
    CONSTRAINT "check_tb_guvenlikKurallari_nat" CHECK ((((islem_id <> 2) AND (nat IS NULL) AND ("natHavuzu_id" IS NULL)) OR ((islem_id = 2) AND (nat IS NULL) AND ("natHavuzu_id" IS NULL)) OR ((islem_id = 2) AND (nat IS NOT NULL) AND ((nat = 'cikisArayuzAdresiniKullan'::public.nat) AND ("natHavuzu_id" IS NULL))) OR ((islem_id = 2) AND (nat IS NOT NULL) AND ((nat = 'natHavuzuKullan'::public.nat) AND ("natHavuzu_id" IS NOT NULL))) OR ((islem_id = 2) AND (nat IS NOT NULL) AND ((nat = 'globalNatKullan'::public.nat) AND ("natHavuzu_id" IS NULL)))))
);


ALTER TABLE public."tb_guvenlikKurallari" OWNER TO usr_antikor;

--
-- TOC entry 712 (class 1259 OID 52884)
-- Name: tb_guvenlikKurallari_id_seq; Type: SEQUENCE; Schema: public; Owner: usr_antikor
--

CREATE SEQUENCE public."tb_guvenlikKurallari_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."tb_guvenlikKurallari_id_seq" OWNER TO usr_antikor;

--
-- TOC entry 8716 (class 0 OID 0)
-- Dependencies: 712
-- Name: tb_guvenlikKurallari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usr_antikor
--

ALTER SEQUENCE public."tb_guvenlikKurallari_id_seq" OWNED BY public."tb_guvenlikKurallari".id;


--
-- TOC entry 8708 (class 0 OID 52839)
-- Dependencies: 708
-- Data for Name: tb_guvenlikKurallari; Type: TABLE DATA; Schema: public; Owner: usr_antikor
--

COPY public."tb_guvenlikKurallari" (id, durum_id, "siraNo", islem_id, "kaynakAdres", "hedefAdres", statefull, aciklama, detaylar, ayarlar, "maxBaglantiSayisi", "besSaniyedeMaxBaglantiSayisi", merkez_profil_id, "trafigiLogla", "agGecidi_id", olusturma_tarihi, guncelleme_tarihi, olusturma_kullanici, guncelleme_kullanici, paket_id, "paketModu", konfig_id, global_konfig_id, nat, "natHavuzu_id", "webFilter", "webFilter_profil_id", antivirus, antivirus_profil_id, "dnsFilter", "dnsFilter_profil_id", "uygulamaKontrol", "uygulamaKontrol_profil_id", ips, ips_profil_id, ratelimit, ratelimit_profil_id, "sshDenetimi", "sshDenetimi_profil_id", waf, waf_profil_id, grup_id) FROM stdin;
55	1	34	2	[{"ipAdresi": "10.0.0.0/8"}]	[{"ipAdresi": "192.168.254.2/32"}]	f	ftp21	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
59	1	28	2	[{"ipAdresi": "10.12.1.0/24"}]	[{"agTanim_id": "43"}]	f	diş_sgk	{}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
61	2	27	2	[{"ipAdresi": "10.0.0.0/8"}]	[{"ipAdresi": "192.168.128.0/17"}]	t	Diş_Hekimliği_Giden	{}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
76	1	25	2	[{"ipAdresi": "10.0.0.0/8"}]	[{"ipAdresi": "10.0.0.0/8"}]	f	vlan	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[4]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
77	1	26	2	[{"ipAdresi": "10.0.0.0/8"}]	[{"ipAdresi": "10.200.201.254/32"}]	f	kayıt sayfası	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[5]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
80	1	24	2	[{"ipAdresi": "10.1.1.214/32"}]	[{"ipAdresi": "192.168.254.125/32"}]	f	test_dmz	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[3]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
84	2	35	2	[{"agTanim_id": "50"}]	[{"ipAdresi": "192.168.252.0/24"}]	f	VxRail_Gelen	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bIo5wPsBegmf	1	3	4	[{"ipAdresi": "192.168.254.126"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	ssh syn flood yapıyor	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	f	\N	2023-04-30 22:59:04.173399+03	2023-04-30 22:59:04.173399+03	ozkan@epati.com.tr	ozkan@epati.com.tr	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
bznqWyp31LfW	1	9	2	[{"ipAdresi": "10.0.0.0/8"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	p_Genel Web Filtreleme Politikası1	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[6]	\N	\N	\N	t	\N	2022-09-14 17:48:46.568573+03	2022-09-14 17:48:46.568573+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	t	-1	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
bznqWyp31LfX	1	8	2	[{"ipAdresi": "10.16.0.0/16"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	p_Ogrenci_isleri1	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[3]	\N	\N	\N	t	\N	2022-09-14 17:48:46.568573+03	2022-09-14 17:48:46.568573+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	t	aPF0L8VeouhL	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
bznqWyp31LfY	1	6	2	[{"ipAdresi": "95.173.165.12"}, {"ipAdresi": "10.2.3.0/24"}, {"ipAdresi": "10.2.1.175"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	sfk_0	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-09-14 17:48:46.568573+03	2022-12-05 15:37:31.393096+03	\N	merkeziyonetimkullanicisi	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
bznqWyp31LfZ	1	7	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "95.0.139.0/24"}, {"ipAdresi": "95.173.165.12"}]	t	sfk_KPS	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-09-14 17:48:46.568573+03	2022-09-14 17:48:46.568573+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
bzx8pZidOtBs	1	5	2	[{"ipAdresi": "192.168.128.0/17"}, {"ipAdresi": "10.250.1.0/24"}, {"ipAdresi": "10.89.8.0/21"}, {"ipAdresi": "10.99.0.0/16"}, {"ipAdresi": "10.10.0.0/16"}]	[{"ipAdresi": "10.12.1.222"}, {"ipAdresi": "192.168.128.200"}, {"ipAdresi": "193.255.129.50"}]	t	MeüTıp-Diş Fakültesi	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-09-16 14:26:00.154683+03	2022-09-16 14:26:00.154683+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
c1HbjXyfWy9f	1	4	5	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "88.198.64.187"}]	t	Elseviewer	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[2]	\N	\N	\N	f	\N	2024-09-30 11:09:20.348384+03	2024-11-12 10:09:41.605327+03	muratkaya	muratkaya	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
cE9K0Wqmvp_t	1	2	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "212.174.172.222"}]	t	Tüik izin	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false, "seciliServislerHaricTut": false}	\N	\N	\N	\N	t	\N	2025-03-07 09:12:08.987923+03	2025-03-07 09:12:08.987923+03	muratkaya	muratkaya	ana-kural-seti	routing	0	0	cikisArayuzAdresiniKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
cJkviyOoKPbO	1	1	2	[{"ipAdresi": "172.16.250.0/24"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	test	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false, "seciliServislerHaricTut": false}	\N	\N	\N	\N	t	\N	2025-04-28 18:46:49.737374+03	2025-04-28 18:46:49.737374+03	\N	\N	ana-kural-seti	routing	0	0	cikisArayuzAdresiniKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfV
1	1	18	2	[{"ipAdresi": "::/0"}]	[{"ipAdresi": "::/0"}]	t	IPv6 Trafiği Serbest	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
10	1	21	2	[{"ipAdresi": "10.1.1.100"}]	[{"ipAdresi": "193.255.128.0/24"}]	t	foto2	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
19	1	23	2	[{"ipAdresi": "193.255.179.1"}, {"ipAdresi": "193.255.129.55"}]	[{"ipAdresi": "193.255.129.55"}, {"ipAdresi": "193.255.179.1"}]	f	test	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[9]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
20	1	29	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"agTanim_id": "28"}]	t	WannaCry Saldırıları için	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
24	1	22	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"agTanim_id": "24"}]	t	USOM	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[7]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	admin	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
34	1	30	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "193.140.71.25/32"}]	t	zd.kamusm.gov.tr	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
46	1	32	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	Telnet Engeli	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
49	1	31	2	[{"ipAdresi": "172.16.0.0/12"}]	[{"ipAdresi": "172.16.0.0/12"}]	f	seri interface izin	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[20]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
54	1	33	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "192.185.109.77"}]	t	testpro	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
85	2	36	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "192.168.252.0/24"}]	f	VxRail_Giden	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[35]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
87	1	19	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "193.255.179.1/32"}]	t	SSL VPN izin	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	[1]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
89	1	37	4	[{"agTanim_id": "52"}]	[{"ipAdresi": "10.180.1.1/32"}]	f	kgs	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": true}	[36]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
9	1	20	2	[{"ipAdresi": "193.255.128.0/24"}]	[{"ipAdresi": "10.1.1.100"}]	t	foto	\N	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
90	2	15	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"agTanim_id": "53"}]	f	mDNS	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[2]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
91	1	38	2	[{"ipAdresi": "10.1.1.0/24"}]	[{"ipAdresi": "192.168.254.0/24"}]	t	DMZ iç erişim	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
aDaT2WgeWaxx	1	13	2	[{"ipAdresi": "193.255.128.67"}, {"ipAdresi": "193.255.128.68"}]	[{"ipAdresi": "193.140.255.23"}]	f	Prolizz	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[1]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
adHTqY3bFylS	1	12	2	[{"ipAdresi": "193.255.0.0/16"}]	[{"ipAdresi": "193.255.128.0/24"}]	t	geçici	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-01-12 16:07:47.465693+03	2022-01-12 16:07:47.465693+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
aRpHHi8Ql4sH	1	16	2	[{"ipAdresi": "193.255.128.150"}]	[{"ipAdresi": "10.2.2.84"}]	t	Bağlantı	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-08-23 14:17:32.826172+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
aU_7Kxu_SSWE	1	14	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "193.140.255.0/24"}]	t	yök tam izin	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	[0]	\N	\N	\N	t	\N	2021-09-30 13:30:36.675544+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
b0bEgEkhhcYD	1	7	4	[{"ipAdresi": "10.255.4.115"}]	[{"ipAdresi": "193.255.180.238"}, {"ipAdresi": "10.2.3.84"}]	t	ssl	{"hedefAdresHaricTut": true, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	f	\N	2022-10-05 10:32:57.830935+03	2022-10-05 10:32:57.830935+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bfN2SlDZEQtG	1	6	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	İstemcisiz SSL Web VPN	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	f	\N	2024-01-24 15:45:41.321038+03	2024-01-24 15:45:41.321038+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bv0XEsv2e7R4	1	10	4	[{"ipAdresi": "10.28.27.15"}]	[{"ipAdresi": "192.168.128.21"}]	t	UDP 137-138, TCP445-UDP123	{"hedefAdresHaricTut": true, "kaynakAdresHaricTut": true}	\N	\N	\N	\N	t	\N	2022-08-02 14:54:52.639114+03	2022-08-02 14:54:52.639114+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bvbit52TFYfT	1	11	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	UDP 161	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-08-09 08:19:47.277888+03	2022-08-09 08:19:47.277888+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bwo3_NwOhbTy	1	9	2	[{"ipAdresi": "10.2.1.34"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	umut global1	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-08-11 18:15:06.366079+03	2022-08-11 18:15:06.366079+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
bxX3CEz5Mk_G	1	8	2	[{"ipAdresi": "10.28.27.15"}, {"ipAdresi": "193.255.130.246"}]	[{"ipAdresi": "192.168.128.21"}, {"ipAdresi": "193.255.129.55"}]	t	tıp fakültesi	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2022-08-31 11:36:43.669984+03	2022-08-31 11:36:43.669984+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
c7AUmpZp1P7C	1	4	5	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"agTanim_id": "c78lIzVZmrkt"}]	t	sicili_bozuk_iplere_erisim_engeli	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2024-12-06 13:49:37.847209+03	2024-12-06 13:49:37.847209+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
cATBqydXKNqB	1	3	4	[{"ipAdresi": "136.243.220.214"}, {"ipAdresi": "3.138.120.156"}, {"ipAdresi": "185.191.171.15"}, {"ipAdresi": "185.191.171.19"}, {"ipAdresi": "85.208.96.206"}, {"agTanim_id": "AcATwMz2Wr1d"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	İngiltereÜzeriSiberSaldırganIpAdresleri	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2025-01-24 13:24:02.846893+03	2025-04-25 10:14:37.706934+03	muratkaya	muratkaya	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
cH_zWCrFO_av	1	2	2	[{"ipAdresi": "10.255.4.0/24"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	DNS Filtreleme	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": true, "seciliServislerHaricTut": false}	\N	\N	\N	\N	t	\N	2025-04-10 16:50:22.668996+03	2025-04-10 16:50:22.668996+03	\N	\N	ana-kural-seti	routing	0	0	globalNatKullan	\N	f	\N	f	\N	t	1	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
ctfUzVmg_bjC	1	5	5	[{"agTanim_id": "c78lIzVZmrkt"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	sicili_bozuk_ip_engelleme	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2024-07-05 14:10:55.524791+03	2024-07-05 14:10:55.524791+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
VayYZisg28TR	1	17	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "192.168.128.21"}, {"ipAdresi": "193.255.130.246"}]	t	TCP	{"hedefAdresHaricTut": true, "kaynakAdresHaricTut": false}	[0]	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	admin	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
VR3QUEv1ywzh	1	40	2	[{"ipAdresi": "192.168.254.0/18"}]	[{"ipAdresi": "193.255.128.0/24"}]	f	test - 2	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
VRtHcTYeTAvz	2	39	2	[{"ipAdresi": "192.168.128.0/17"}]	[{"ipAdresi": "10.12.1.0/24"}]	f	diş-ftp	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
WlBevnp8BKK-	1	41	2	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "193.255.180.183"}]	f	rdp	{"hedefPortHaricTut": false, "hedefAdresHaricTut": false, "kaynakPortHaricTut": false, "kaynakAdresHaricTut": false}	\N	\N	\N	\N	t	\N	2021-04-09 14:35:22.076588+03	2021-11-02 09:43:02.161404+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
cP2CYUl7gYrT	1	1	4	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	[{"ipAdresi": "0.0.0.0/0"}, {"ipAdresi": "::/0"}]	t	testt	{"hedefAdresHaricTut": false, "kaynakAdresHaricTut": false, "seciliServislerHaricTut": false}	[1]	\N	\N	\N	t	\N	2025-07-09 11:47:57.837832+03	2025-07-09 11:47:57.837832+03	\N	\N	ana-kural-seti	routing	0	0	\N	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	bznqWyp31LfU
\.


--
-- TOC entry 8718 (class 0 OID 0)
-- Dependencies: 712
-- Name: tb_guvenlikKurallari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: usr_antikor
--

SELECT pg_catalog.setval('public."tb_guvenlikKurallari_id_seq"', 92, true);


--
-- TOC entry 8537 (class 2606 OID 58143)
-- Name: tb_guvenlikKurallari tb_guvenlikKurallari_pkey; Type: CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "tb_guvenlikKurallari_pkey" PRIMARY KEY (id, konfig_id);


--
-- TOC entry 8531 (class 1259 OID 58681)
-- Name: idx_guvenlikKurallari_adresler; Type: INDEX; Schema: public; Owner: usr_antikor
--

CREATE INDEX "idx_guvenlikKurallari_adresler" ON public."tb_guvenlikKurallari" USING gin ("kaynakAdres", "hedefAdres");


--
-- TOC entry 8532 (class 1259 OID 58693)
-- Name: idx_tb_guvenlikKurallari_grup_id; Type: INDEX; Schema: public; Owner: usr_antikor
--

CREATE INDEX "idx_tb_guvenlikKurallari_grup_id" ON public."tb_guvenlikKurallari" USING btree (grup_id);


--
-- TOC entry 8533 (class 1259 OID 58695)
-- Name: idx_tb_guvenlikKurallari_paket_id; Type: INDEX; Schema: public; Owner: usr_antikor
--

CREATE INDEX "idx_tb_guvenlikKurallari_paket_id" ON public."tb_guvenlikKurallari" USING btree (paket_id);


--
-- TOC entry 8534 (class 1259 OID 58697)
-- Name: idx_tb_guvenlikKurallari_siraNo; Type: INDEX; Schema: public; Owner: usr_antikor
--

CREATE INDEX "idx_tb_guvenlikKurallari_siraNo" ON public."tb_guvenlikKurallari" USING btree ("siraNo");


--
-- TOC entry 8535 (class 1259 OID 58756)
-- Name: tb_guvenlikKurallari_konfig_id_idx; Type: INDEX; Schema: public; Owner: usr_antikor
--

CREATE INDEX "tb_guvenlikKurallari_konfig_id_idx" ON public."tb_guvenlikKurallari" USING btree (konfig_id);


--
-- TOC entry 8538 (class 2606 OID 59192)
-- Name: tb_guvenlikKurallari fk_tb_guvenlikKurallari_grup_id_konfig_id_global_konfig_id; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "fk_tb_guvenlikKurallari_grup_id_konfig_id_global_konfig_id" FOREIGN KEY (grup_id, konfig_id, global_konfig_id) REFERENCES public."tb_guvenlikKurallari_gruplari"(id, konfig_id, global_konfig_id) ON UPDATE CASCADE ON DELETE RESTRICT DEFERRABLE;


--
-- TOC entry 8539 (class 2606 OID 59197)
-- Name: tb_guvenlikKurallari fk_tb_guvenlikKurallari_natHavuzu_id; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "fk_tb_guvenlikKurallari_natHavuzu_id" FOREIGN KEY ("natHavuzu_id", konfig_id) REFERENCES public."tb_natHavuzlari"(id, konfig_id);


--
-- TOC entry 8540 (class 2606 OID 59202)
-- Name: tb_guvenlikKurallari fk_tb_guvenlikKurallari_paket_id; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "fk_tb_guvenlikKurallari_paket_id" FOREIGN KEY (paket_id, konfig_id, global_konfig_id) REFERENCES public."tb_guvenlikKurallari_paketler"(id, konfig_id, global_konfig_id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 8541 (class 2606 OID 59217)
-- Name: tb_guvenlikKurallari fk_tb_guvenlikKurallari_tb_guvenlikKurallari_islemler_1; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "fk_tb_guvenlikKurallari_tb_guvenlikKurallari_islemler_1" FOREIGN KEY (islem_id) REFERENCES sabitler."tb_guvenlikKurallari_islemler"(id);


--
-- TOC entry 8542 (class 2606 OID 59432)
-- Name: tb_guvenlikKurallari fk_tb_sp_ratelimit_ratelimit_profil_id_konfig_id; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT fk_tb_sp_ratelimit_ratelimit_profil_id_konfig_id FOREIGN KEY (ratelimit_profil_id, konfig_id) REFERENCES public.tb_sp_ratelimit(id, konfig_id);


--
-- TOC entry 8543 (class 2606 OID 60027)
-- Name: tb_guvenlikKurallari tb_guvenlikKurallari_durum_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "tb_guvenlikKurallari_durum_id_fkey" FOREIGN KEY (durum_id) REFERENCES sabitler.tb_durumlar(id);


--
-- TOC entry 8544 (class 2606 OID 60047)
-- Name: tb_guvenlikKurallari tb_guvenlikKurallari_konfig_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: usr_antikor
--

ALTER TABLE ONLY public."tb_guvenlikKurallari"
    ADD CONSTRAINT "tb_guvenlikKurallari_konfig_id_fk" FOREIGN KEY (konfig_id) REFERENCES merkez.tb_konfigler(id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE;


--
-- TOC entry 8706 (class 3256 OID 61190)
-- Name: tb_guvenlikKurallari global_konfig_id_scope; Type: POLICY; Schema: public; Owner: usr_antikor
--

CREATE POLICY global_konfig_id_scope ON public."tb_guvenlikKurallari" AS RESTRICTIVE TO usr_antikor_rls USING ((global_konfig_id = COALESCE((current_setting('antikor.global_konfig_id'::text, true))::integer, 0))) WITH CHECK ((global_konfig_id = COALESCE((current_setting('antikor.global_konfig_id'::text, true))::integer, 0)));


--
-- TOC entry 8707 (class 3256 OID 61244)
-- Name: tb_guvenlikKurallari konfig_id_scope; Type: POLICY; Schema: public; Owner: usr_antikor
--

CREATE POLICY konfig_id_scope ON public."tb_guvenlikKurallari" TO usr_antikor_rls USING ((konfig_id = COALESCE((current_setting('antikor.konfig_id'::text, true))::integer, 0))) WITH CHECK ((konfig_id = COALESCE((current_setting('antikor.konfig_id'::text, true))::integer, 0)));


--
-- TOC entry 8705 (class 0 OID 52839)
-- Dependencies: 708
-- Name: tb_guvenlikKurallari; Type: ROW SECURITY; Schema: public; Owner: usr_antikor
--

ALTER TABLE public."tb_guvenlikKurallari" ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 8715 (class 0 OID 0)
-- Dependencies: 708
-- Name: TABLE "tb_guvenlikKurallari"; Type: ACL; Schema: public; Owner: usr_antikor
--

GRANT ALL ON TABLE public."tb_guvenlikKurallari" TO usr_antikor_rls;


--
-- TOC entry 8717 (class 0 OID 0)
-- Dependencies: 712
-- Name: SEQUENCE "tb_guvenlikKurallari_id_seq"; Type: ACL; Schema: public; Owner: usr_antikor
--

GRANT ALL ON SEQUENCE public."tb_guvenlikKurallari_id_seq" TO usr_antikor_rls;


-- Completed on 2025-07-30 14:49:32 +03

--
-- PostgreSQL database dump complete
--

