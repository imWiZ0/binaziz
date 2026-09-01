--
-- PostgreSQL database dump
--

\restrict ClPHhZWkM8zgNdSlOBX7u8grf8ABghjjFWBNvvigzYXH37YAxldLdByRUZd7wKb

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg13+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_item (
    id text NOT NULL,
    title text NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    line_item_id text,
    inventory_item_id text,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_item OWNER TO postgres;

--
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    requires_shipping boolean DEFAULT true NOT NULL,
    description text,
    title text,
    thumbnail text,
    metadata jsonb
);


ALTER TABLE public.inventory_item OWNER TO postgres;

--
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_level (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    inventory_item_id text NOT NULL,
    location_id text NOT NULL,
    stocked_quantity numeric DEFAULT 0 NOT NULL,
    reserved_quantity numeric DEFAULT 0 NOT NULL,
    incoming_quantity numeric DEFAULT 0 NOT NULL,
    metadata jsonb,
    raw_stocked_quantity jsonb,
    raw_reserved_quantity jsonb,
    raw_incoming_quantity jsonb
);


ALTER TABLE public.inventory_level OWNER TO postgres;

--
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_inventory_item (
    variant_id character varying(255) NOT NULL,
    inventory_item_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    required_quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_inventory_item OWNER TO postgres;

--
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    line_item_id text,
    location_id text NOT NULL,
    quantity numeric NOT NULL,
    external_id text,
    description text,
    created_by text,
    metadata jsonb,
    inventory_item_id text NOT NULL,
    allow_backorder boolean DEFAULT false,
    raw_quantity jsonb
);


ALTER TABLE public.reservation_item OWNER TO postgres;

--
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
fulit_01KXJZNVXADP68D9GPN7A3MST5	L / Black	SHIRT-L-BLACK		1	{"value": "1", "precision": 20}	ordli_01KXJZH7AGGHFWFRA1C9J20MH3	\N	ful_01KXJZNVXAZRS6XJBX4BBVFG9E	2026-07-15 13:32:52.012+00	2026-07-15 13:32:52.012+00	\N
fulit_01KXKPEZFFF11PJKY6SQHQSR7V	L / White	SHIRT-L-WHITE		1	{"value": "1", "precision": 20}	ordli_01KXKP3R0HWTQS57DMZBEKXT89	\N	ful_01KXKPEZFFFB3M0STDCVQFAJXC	2026-07-15 20:11:03.536+00	2026-07-15 20:11:03.536+00	\N
fulit_01KXN8TDA97PKNED0T2TWPF1A7	L / Black	SHIRT-L-BLACK		1	{"value": "1", "precision": 20}	ordli_01KXN8Q40YHR159PEX3Z090MWW	\N	ful_01KXN8TDA96HHED96BJNJ9XADP	2026-07-16 10:51:06.954+00	2026-07-16 10:51:06.954+00	\N
fulit_01KXVC9HNWCHDKEJRQYCHWN62G	L / Black	SHIRT-L-BLACK		1	{"value": "1", "precision": 20}	ordli_01KXN8Q40YHR159PEX3Z090MWW	\N	ful_01KXVC9HNWCTTWKJA0B3HQDTW5	2026-07-18 19:47:15.262+00	2026-07-18 19:47:15.262+00	\N
fulit_01M1CBPHHFSTYFQKMT1XZSMRKV	L / Black	SHIRT-L-BLACK		1	{"value": "1", "precision": 20}	ordli_01M1CBJGXW3PMJ954G74BY1AJS	\N	ful_01M1CBPHHH8H1YCMS8MHJ9PSW5	2026-08-31 16:51:03.349+00	2026-08-31 16:51:03.349+00	\N
\.


--
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_item (id, created_at, updated_at, deleted_at, sku, origin_country, hs_code, mid_code, material, weight, length, height, width, requires_shipping, description, title, thumbnail, metadata) FROM stdin;
iitem_01KX0A59ECYBSKR44M6RRQB7CG	2026-07-08 07:30:28.942+00	2026-07-08 07:30:28.942+00	\N	SHIRT-S-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	S / Black	S / Black	\N	\N
iitem_01KX0A59ECRJBATG6Z7CHCPFZ8	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-S-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	S / White	S / White	\N	\N
iitem_01KX0A59EC22M445ZAGJBR8V2P	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-M-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	M / Black	M / Black	\N	\N
iitem_01KX0A59ED0R13A6YEA3H1NKYH	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-M-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	M / White	M / White	\N	\N
iitem_01KX0A59EDGWF7H4E9747K6GT3	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-L-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	L / Black	L / Black	\N	\N
iitem_01KX0A59EDZW0K9WHHQA52W7NN	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-L-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	L / White	L / White	\N	\N
iitem_01KX0A59EDYP361A7Q86ASDDWW	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-XL-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / Black	XL / Black	\N	\N
iitem_01KX0A59EDT1DG20KCCEDG021F	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHIRT-XL-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / White	XL / White	\N	\N
iitem_01KX0A59EDWYDCRZPBK85D79EY	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATSHIRT-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KX0A59EDYKA5Q62Y5S6J48S9	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATSHIRT-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KX0A59ED9K275H07TTC2TFHR	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATSHIRT-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KX0A59ED0ZSE0YJHMPJBE1A7	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATSHIRT-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01KX0A59ED7PT4FQJFP25J6AQQ	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATPANTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KX0A59EEP4FCY6BFFW9WJGTR	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATPANTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KX0A59EEV1H4DRSDM1X6P1TF	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATPANTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KX0A59EESTRSBZMKADDYZ21T	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SWEATPANTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01KX0A59EEVNS27FR597CK2P9G	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHORTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01KX0A59EEW0QA039K923TNFQ3	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHORTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01KX0A59EESVT6YVH2PQBPA7ZZ	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHORTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01KX0A59EESBPWJ1VB42PYCSK9	2026-07-08 07:30:28.943+00	2026-07-08 07:30:28.943+00	\N	SHORTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
\.


--
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
ilev_01KX0A59GW4VPNFY0Q4PSSCGTR	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59ECRJBATG6Z7CHCPFZ8	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GW1A08EQ5M559V4KBC	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59ECYBSKR44M6RRQB7CG	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GWHE3K9T0TSST30A18	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59ED0R13A6YEA3H1NKYH	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GW3WTVKWYFDNH8WWZX	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59ED0ZSE0YJHMPJBE1A7	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GW4P09W5M9B271RQK0	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59ED7PT4FQJFP25J6AQQ	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GWRRPBM3KSH9GYD2NC	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDGWF7H4E9747K6GT3	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX336VAT1FM2KB6AWR	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDT1DG20KCCEDG021F	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX5HVJFXQ9FRBSNKRR	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDWYDCRZPBK85D79EY	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX8FPBDFPF5YACJ6F5	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDYKA5Q62Y5S6J48S9	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GXS58FP6CBSY83QJJ6	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDYP361A7Q86ASDDWW	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX7B1R10C0ZZ5ZVSBC	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EDZW0K9WHHQA52W7NN	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX18CR5PBMXDY06SM8	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EEP4FCY6BFFW9WJGTR	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GXE4P6B5KXQY32W0CN	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EESBPWJ1VB42PYCSK9	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX08JV93NMF12K13MC	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EESTRSBZMKADDYZ21T	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GXCQRHH7ZCN4B2BP4G	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EESVT6YVH2PQBPA7ZZ	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GXQFKE54W860NCKBEW	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EEV1H4DRSDM1X6P1TF	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GX547AD4EBSHJ951G3	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EEVNS27FR597CK2P9G	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GXWXEKR7YDM2BCMW1X	2026-07-08 07:30:29.022+00	2026-07-08 07:30:29.022+00	\N	iitem_01KX0A59EEW0QA039K923TNFQ3	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GW4BKTTEJ6E84PHGEA	2026-07-08 07:30:29.022+00	2026-07-08 09:18:59.629+00	\N	iitem_01KX0A59ED9K275H07TTC2TFHR	sloc_01KX0A5960FFST3QWX2BXPDHHD	1000000	1	0	\N	{"value": "1000000", "precision": 20}	{"value": "1", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KX0A59GW0H7E8BWHPW5363MW	2026-07-08 07:30:29.021+00	2026-07-19 20:50:31.865+00	\N	iitem_01KX0A59EC22M445ZAGJBR8V2P	sloc_01KX0A5960FFST3QWX2BXPDHHD	9999	0	0	\N	{"value": "9999", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
\.


--
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_inventory_item (variant_id, inventory_item_id, id, required_quantity, created_at, updated_at, deleted_at) FROM stdin;
variant_01KX0A59DRQFWD6A00E185S6TQ	iitem_01KX0A59ECYBSKR44M6RRQB7CG	pvitem_01KX0A59EWVC0KVSAND79BFD3H	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DRZFRX64XQD3BF2XFH	iitem_01KX0A59ECRJBATG6Z7CHCPFZ8	pvitem_01KX0A59EWA4TTK4Q8SW931P95	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DRESW5BSHW1ZEHPG4V	iitem_01KX0A59EC22M445ZAGJBR8V2P	pvitem_01KX0A59EWHE6MNGJNNJXXSH34	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DR4G5N488CF9542AW0	iitem_01KX0A59ED0R13A6YEA3H1NKYH	pvitem_01KX0A59EWB67C4JP9XY8HMDN1	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DR6SMPJ73EHVMWP0DR	iitem_01KX0A59EDGWF7H4E9747K6GT3	pvitem_01KX0A59EWJEWTVJ2TC6NCY9ZF	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DRTCDTKFEH8XNY7X82	iitem_01KX0A59EDZW0K9WHHQA52W7NN	pvitem_01KX0A59EXJBWNV6HAVNRQHA6M	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DRR5D6E1GGFG8NHZ4B	iitem_01KX0A59EDYP361A7Q86ASDDWW	pvitem_01KX0A59EX09NPQSDJX6095D06	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DS544ZHXRP39KEN5ZH	iitem_01KX0A59EDT1DG20KCCEDG021F	pvitem_01KX0A59EXT8KK86JS5FP158EX	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSWCRXKC3V5BM538PZ	iitem_01KX0A59EDWYDCRZPBK85D79EY	pvitem_01KX0A59EXPBQT7HQGQFFQQ341	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSWBY9S9B71V67NAPN	iitem_01KX0A59EDYKA5Q62Y5S6J48S9	pvitem_01KX0A59EX01YWSCNDQA0F1JJ3	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DS3FP3VFVTK54CVFTS	iitem_01KX0A59ED9K275H07TTC2TFHR	pvitem_01KX0A59EX3THRVX2W15MWJWPW	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSMJRJ713Z582XEXBC	iitem_01KX0A59ED0ZSE0YJHMPJBE1A7	pvitem_01KX0A59EX8ZTB2DX4MN8MAM1M	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSR8P1E1EDQQWTPDPD	iitem_01KX0A59ED7PT4FQJFP25J6AQQ	pvitem_01KX0A59EXKQEA3P7JXZSBGMYS	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSWE25HZQ7SN53ZV80	iitem_01KX0A59EEP4FCY6BFFW9WJGTR	pvitem_01KX0A59EXD7XKBYKM3JC4FSM7	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSCWZ4AYNC8HFHEAXA	iitem_01KX0A59EEV1H4DRSDM1X6P1TF	pvitem_01KX0A59EXQN3121061NG4V36Q	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DSYJZDZ6CM5313ZMZ6	iitem_01KX0A59EESTRSBZMKADDYZ21T	pvitem_01KX0A59EX40MZC13EFAZW3E3W	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DS87ENFMF05WN93EEC	iitem_01KX0A59EEVNS27FR597CK2P9G	pvitem_01KX0A59EXZ66N9RK34BA4JDVB	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DTKPJNAEE2MNC9TZH6	iitem_01KX0A59EEW0QA039K923TNFQ3	pvitem_01KX0A59EXJFFFK47W31D4YYYS	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DT8XJ1E4C531C3VV7C	iitem_01KX0A59EESVT6YVH2PQBPA7ZZ	pvitem_01KX0A59EXWXNQ4B98K2RVHR57	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
variant_01KX0A59DT1M832V17NTMHRNHT	iitem_01KX0A59EESBPWJ1VB42PYCSK9	pvitem_01KX0A59EXJ51DYFR6ZQWDAM4E	1	2026-07-08 07:30:28.9566+00	2026-07-08 07:30:28.9566+00	\N
\.


--
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_item (id, created_at, updated_at, deleted_at, line_item_id, location_id, quantity, external_id, description, created_by, metadata, inventory_item_id, allow_backorder, raw_quantity) FROM stdin;
resitem_01KX0GBZH9KFA0BTC9TZ82QADR	2026-07-08 09:18:59.629+00	2026-07-08 09:18:59.629+00	\N	ordli_01KX0GBZF9CWTYXFEYGJN97A3G	sloc_01KX0A5960FFST3QWX2BXPDHHD	1	\N	\N	\N	\N	iitem_01KX0A59ED9K275H07TTC2TFHR	f	{"value": "1", "precision": 20}
\.


--
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_pkey PRIMARY KEY (id);


--
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_inventory_item
    ADD CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id);


--
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_pkey PRIMARY KEY (id);


--
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON public.product_variant_inventory_item USING btree (deleted_at);


--
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON public.fulfillment_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON public.fulfillment_item USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON public.fulfillment_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON public.fulfillment_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (id);


--
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON public.inventory_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON public.inventory_item USING btree (sku) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON public.inventory_level USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_location_id" ON public.inventory_level USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON public.reservation_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON public.reservation_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON public.reservation_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_location_id" ON public.reservation_item USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ClPHhZWkM8zgNdSlOBX7u8grf8ABghjjFWBNvvigzYXH37YAxldLdByRUZd7wKb

