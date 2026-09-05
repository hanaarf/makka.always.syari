// =========================================================================
// PRODUK DATA & SWR CACHE MODULE (MAKKA ALWAYS SYARI)
// =========================================================================

const GSHEET_API_URL = "https://script.google.com/macros/s/AKfycbx8W31PTpYm-1pMBBiI0QUB0WIEiC72KOYBrsv2YWiz820OP1F6C8ma9bK3JgSsmeH8ig/exec";
const CACHE_KEY_PRODUCTS = "makka_products_cache_v2";
const CACHE_KEY_TIMESTAMP = "makka_products_timestamp_v2";

// Default varian standar jika produk belum memiliki varian terdefinisi di spreadsheet
const DEFAULT_VARIANTS = [
  { size: "S-M", harga: 455000, stock: 10 },
  { size: "L-XL", harga: 500000, stock: 10 }
];

// Snapshot data bawaan awal dengan multi-varian (S-M & L-XL)
const INITIAL_PRODUCTS = [
  {
    "id": 1,
    "nama_series": "Reline Abaya",
    "deskripsi": "PO Gamis/Syari Material Buruj Sultan Premium (Original Sultan) — Bahan flowy, dingin, anti-kusut, mewah & elegan | Bebas request warna, bahan Sultan lainnya, & size | DP cukup 100rb, cicilan santai 4-8 minggu, estimasi PO cepat 7 hari & bisa request tanggal ready | Promo terbatas, gabung PO sekarang via DM/WA!",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/13icKrifZTjY00v2Eu0HgSI3L__AeQiur/view?usp=sharing",
    "kategori": "abaya",
    "material": "sultan_uv",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 2,
    "nama_series": "Shibori Abaya",
    "deskripsi": "Material natural fabric viscose rayon waterdye. Dgn 3 pilihan warna\nBisa request size\nBisa cicil berapa aja sampe ready\nDp cukup 100rb🤗",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1eEEnJl8o7dM7JzEBE44aQWamtEt6RvPi/view?usp=sharing",
    "kategori": "abaya",
    "material": "viscose rayon",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 3,
    "nama_series": "Rosella Abaya",
    "deskripsi": "Materian natural fabric visra waterdye. Kainnya flowy , jatoh dan adem.. wajib cobaa siih inii🥰",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/12ZLBqrRIpmo0uVK5Zqwmsv5OX4EWYPci/view?usp=sharing",
    "kategori": "abaya",
    "material": "visra",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 4,
    "nama_series": "Raya Series",
    "deskripsi": "Hadir untuk menjadi pilihan mu dihari raya nanti😍. Hadir untuk menjadi pilihan mu dihari raya nanti😍",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1yOk1XQDRgun0PVHbZNxboNG-BUc-dHZb/view?usp=sharing",
    "kategori": "abaya",
    "material": "lainnya",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 5,
    "nama_series": "Aleeza",
    "deskripsi": "Aleeza special eid series hadir Dgn 2 pilihan model gamis yg akan hadir , model kantong dan model kombinasi hitam. Mengunakan kain Mina anti uv dan mazen anti uv orginal sultan.. 2 jenis kain ini udah ga usah diragukan lagi kwalitasnya.. premiuam, ademnya, lembutnya , ga mudah kusut, flowy..",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1w1Qy34V5P1BtT4QjrHm2YuyiVUFpKkIw/view?usp=sharing",
    "kategori": "abaya",
    "material": "anti uv",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 6,
    "nama_series": "Daily dress",
    "deskripsi": "Material levina dgn permukaan bertektur namun tidak kasar. Tidak perlu distrika ( makin memudahkan hari2 kan ;)\r\n• Busui friendly\r\n• Manset karet simple tapi manis\r\n• PO All size xs - xxl\r\n• Bisa request size pastinya\r\n• Dp 50rb ajaa\r\n• Pengerjaan 3-4minggu\r\n• Warna yg ready hanya 3 dusty pink, blue mint, lemont khaki",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1QtLDeD4IgMWPt4CwkujW-Xdl54rWU4et/view?usp=drive_link",
    "kategori": "abaya",
    "material": "levina",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 7,
    "nama_series": "classy daisy",
    "deskripsi": "Material nidaul silky Karakteristik bahan seperti bahan fursan abaya2 arab.. jatoh,, flowy lembut permukaan halus dan bahan adem isnyaallah..",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1q-tjm_SGWA1g3388sllxBUScpJOUVM60/view?usp=sharing",
    "kategori": "abaya",
    "material": "nidaul",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  },
  {
    "id": 8,
    "nama_series": "Jasmine series",
    "deskripsi": "Material bisa request bahan mazen anti uv, mina anti uv atau internet anti uv original sultan yaah..",
    "berat": "1kg",
    "foto": "https://drive.google.com/file/d/1E8dIM0PhwzL0l7xBCmRg0q09J5Yob_BV/view?usp=sharing",
    "kategori": "eid-series",
    "material": "sultan-uv",
    "status_code": "po",
    "variants": [
      { "size": "S-M", "harga": 455000, "stock": 10 },
      { "size": "L-XL", "harga": 500000, "stock": 10 }
    ]
  }
];

// Helper Convert Google Drive URL ke thumbnail berkecepatan tinggi
function convertDriveUrl(url) {
  if (!url) return 'https://placehold.co/600x800/e2e8f0/475569?text=Makka+Syari';
  const cleanUrl = String(url).replace(/\s+/g, '');
  const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return cleanUrl;
}

// Helper Format Currency Rupiah
function formatRupiah(number) {
  if (!number || number == 0 || isNaN(number)) return "Rp 455.000";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Helper Cari Harga Berdasarkan Pilihan Size (S, M, L, XL, S-M, L-XL)
function getVariantPrice(prod, selectedSize) {
  if (!prod) return 455000;
  
  const cleanSize = (selectedSize || 'S').toString().trim().toUpperCase();

  if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
    // 1. Cek kecocokan persis (misal 'S-M' atau 'L-XL' atau 'S')
    const exact = prod.variants.find(v => (v.size || '').toString().trim().toUpperCase() === cleanSize);
    if (exact && parseInt(exact.harga) > 0) return parseInt(exact.harga);

    // 2. Cek mapping size: S atau M -> varian S-M
    if (cleanSize === 'S' || cleanSize === 'M') {
      const sm = prod.variants.find(v => {
        const s = (v.size || '').toString().toUpperCase();
        return s.includes('S-M') || s.includes('S/M') || s === 'S' || s === 'M';
      });
      if (sm && parseInt(sm.harga) > 0) return parseInt(sm.harga);
    }

    // 3. Cek mapping size: L atau XL -> varian L-XL
    if (cleanSize === 'L' || cleanSize === 'XL') {
      const lxl = prod.variants.find(v => {
        const s = (v.size || '').toString().toUpperCase();
        return s.includes('L-XL') || s.includes('L/XL') || s === 'L' || s === 'XL';
      });
      if (lxl && parseInt(lxl.harga) > 0) return parseInt(lxl.harga);
    }

    // 4. Fallback ke varian pertama yang memiliki harga
    const firstValid = prod.variants.find(v => parseInt(v.harga) > 0);
    if (firstValid) return parseInt(firstValid.harga);
  }

  // Fallback jika ada harga satuan langsung
  if (prod.harga && parseInt(prod.harga) > 0) {
    return parseInt(prod.harga);
  }

  // Default harga termurah S-M jika data belum lengkap
  return (cleanSize === 'L' || cleanSize === 'XL') ? 500000 : 455000;
}

// Helper Range Harga Produk dari Varian
function getProductPriceRange(prod) {
  const priceS = getVariantPrice(prod, 'S');
  const priceL = getVariantPrice(prod, 'L');
  return {
    min: Math.min(priceS, priceL),
    max: Math.max(priceS, priceL)
  };
}

// Helper Format Harga untuk Kartu Produk / Halaman Katalog & Home
// Sesuai permintaan: Menampilkan harga pertama (ukuran S-M yang termurah)
function formatProductPrice(prod) {
  const defaultPrice = getVariantPrice(prod, 'S');
  return formatRupiah(defaultPrice);
}

// Normalisasi data produk dari Google Sheets
function normalizeProducts(rawList) {
  if (!Array.isArray(rawList)) return [];

  return rawList.map(item => {
    let variants = [];

    if (Array.isArray(item.variants) && item.variants.length > 0) {
      variants = item.variants;
    } else if (item.harga && parseInt(item.harga) > 0) {
      variants = [
        { size: 'S-M', harga: parseInt(item.harga), stock: 10 },
        { size: 'L-XL', harga: parseInt(item.harga) + 45000, stock: 10 }
      ];
    } else {
      // Fallback default varian harga jika sheet varian belum ter-deploy di Apps Script
      variants = [
        { size: 'S-M', harga: 455000, stock: 10 },
        { size: 'L-XL', harga: 500000, stock: 10 }
      ];
    }

    return {
      ...item,
      variants: variants
    };
  });
}

// Ambil produk secara SINKRON (Langsung tanpa menunggu network/loading)
function getProductsSync() {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
    if (cached !== null) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeProducts(parsed);
      }
    }
  } catch (e) {
    console.warn("Gagal membaca cache produk lokal:", e);
  }
  return INITIAL_PRODUCTS;
}

// Fetch data terbaru dari Google Sheets secara background (SWR pattern)
async function fetchProductsRealtime(onSuccess, onError) {
  try {
    const response = await fetch(GSHEET_API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rawData = await response.json();

    let freshProducts = [];
    if (Array.isArray(rawData)) {
      freshProducts = normalizeProducts(rawData);
    } else if (rawData && Array.isArray(rawData.products)) {
      const variants = Array.isArray(rawData.variants) ? rawData.variants : [];
      freshProducts = rawData.products.map(p => {
        const prodVariants = variants.filter(v => String(v.product_id) === String(p.id));
        return {
          ...p,
          variants: prodVariants.length > 0 ? prodVariants : (p.variants || [])
        };
      });
      freshProducts = normalizeProducts(freshProducts);
    }

    if (freshProducts.length > 0) {
      localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(freshProducts));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
      if (typeof onSuccess === 'function') {
        onSuccess(freshProducts);
      }
      return freshProducts;
    }
  } catch (err) {
    console.warn("Fetch background gsheet gagal, menggunakan data lokal:", err);
    if (typeof onError === 'function') {
      onError(err);
    }
  }
  return getProductsSync();
}
