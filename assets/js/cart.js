// =========================================================================
// KONFIGURASI API ONGKIR (KHUSUS JNE EXPRESS) & CART MANAGEMENT
// =========================================================================

const GSHEET_API_ongkir_URL = "https://script.google.com/macros/s/AKfycbzECJ7du2Lskj4G0R-G6WYIoL4LDTxVardNztg6Dq2w-IaZOKqrOl3Eo0IacKS2p71eMQ/exec";
let currentEstimatedOngkir = 0;
let isCalculatingOngkir = false;

// =========================================================================
// 1. HELPER & LOCAL STORAGE MANAGEMENT
// =========================================================================

function parseBeratToGram(beratVal) {
  if (!beratVal) return 1000;
  if (typeof beratVal === 'number') return beratVal < 10 ? beratVal * 1000 : beratVal;

  const str = beratVal.toString().toLowerCase().trim();
  const numericValue = parseFloat(str.replace(/[^0-9.]/g, '')) || 1;

  if (str.includes('kg')) return Math.round(numericValue * 1000);
  if (str.includes('g') || str.includes('gram')) return Math.round(numericValue);

  return Math.round(numericValue < 10 ? numericValue * 1000 : numericValue);
}

function formatRupiah(number) {
  if (!number || isNaN(number) || number === 0) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

function convertDriveUrl(url) {
  if (!url) return 'https://placehold.co/200?text=Produk';
  const cleanUrl = String(url).replace(/\s+/g, '');
  const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return cleanUrl;
}

function getCart() {
  try {
    const cart = localStorage.getItem('makka_cart');
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error("Gagal parse cart dari localStorage:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('makka_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function addToCart(product, qty = 1, size = 'S', color = 'Standard') {
  let cart = getCart();
  const beratInGram = parseBeratToGram(product.berat);
  const finalPrice = product.harga ? parseInt(product.harga) : getVariantPrice(product, size);
  const existingIndex = cart.findIndex(item => String(item.id) === String(product.id) && item.size === size && item.color === color);

  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      id: product.id,
      nama: product.nama_series || product.nama,
      harga: finalPrice,
      berat: beratInGram,
      foto: product.foto,
      qty: qty,
      size: size,
      color: color
    });
  }

  saveCart(cart);
  alert(`"${product.nama_series || product.nama}" (Ukuran: ${size}) berhasil ditambahkan ke keranjang!`);
}

// =========================================================================
// QUICK ADD TO CART MODAL (PILIH UKURAN S/M/L/XL DENGAN HARGA REALTIME)
// =========================================================================

let quickModalProduct = null;
let quickModalSelectedSize = 'S';

function ensureQuickModalExists() {
  if (document.getElementById('quickAddModal')) return;

  const modalHtml = `
    <div id="quickAddModal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;">
      <div style="background:#ffffff; border-radius:16px; width:100%; max-width:440px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); overflow:hidden; animation:fadeInModal 0.2s ease-out;">
        <div style="padding:16px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:16px; font-weight:700; margin:0; color:#1e293b;">Pilih Ukuran</h3>
          <button onclick="closeQuickAddModal()" style="background:none; border:none; font-size:20px; color:#94a3b8; cursor:pointer; padding:4px;">✕</button>
        </div>
        <div style="padding:20px;">
          <div style="display:flex; gap:14px; margin-bottom:18px;">
            <img id="quickModalImg" src="" alt="Produk" style="width:72px; height:72px; object-fit:cover; border-radius:10px; border:1px solid #e2e8f0;" />
            <div style="flex:1;">
              <h4 id="quickModalTitle" style="font-size:15px; font-weight:700; margin:0 0 4px 0; color:#0f172a;">Nama Produk</h4>
              <div id="quickModalPrice" style="font-size:18px; font-weight:800; color:#4F46E5;">Rp 455.000</div>
              <span id="quickModalWeight" style="font-size:12px; color:#64748b;">(Berat: 1kg)</span>
            </div>
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:8px;">Pilih Ukuran:</label>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
              <button type="button" class="quick-size-btn" onclick="selectQuickSize('S')" style="padding:10px; font-weight:700; border:2px solid #4F46E5; background:#EEF2FF; color:#4F46E5; border-radius:8px; cursor:pointer;">S</button>
              <button type="button" class="quick-size-btn" onclick="selectQuickSize('M')" style="padding:10px; font-weight:700; border:1px solid #cbd5e1; background:#ffffff; color:#334155; border-radius:8px; cursor:pointer;">M</button>
              <button type="button" class="quick-size-btn" onclick="selectQuickSize('L')" style="padding:10px; font-weight:700; border:1px solid #cbd5e1; background:#ffffff; color:#334155; border-radius:8px; cursor:pointer;">L</button>
              <button type="button" class="quick-size-btn" onclick="selectQuickSize('XL')" style="padding:10px; font-weight:700; border:1px solid #cbd5e1; background:#ffffff; color:#334155; border-radius:8px; cursor:pointer;">XL</button>
            </div>
            <div id="quickSizeHint" style="font-size:12px; color:#64748b; margin-top:6px;">Ukuran S & M: harga S-M | Ukuran L & XL: harga L-XL</div>
          </div>

          <div style="margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
            <label style="font-size:13px; font-weight:600; color:#334155;">Jumlah:</label>
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" onclick="changeQuickQty(-1)" style="width:32px; height:32px; border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc; font-weight:700; cursor:pointer;">−</button>
              <input type="number" id="quickModalQty" value="1" min="1" max="99" style="width:48px; height:32px; text-align:center; border:1px solid #cbd5e1; border-radius:6px;" />
              <button type="button" onclick="changeQuickQty(1)" style="width:32px; height:32px; border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc; font-weight:700; cursor:pointer;">+</button>
            </div>
          </div>

          <button type="button" onclick="confirmQuickAddToCart()" class="btn btn--indigo" style="width:100%; padding:12px; font-weight:700; border-radius:8px; cursor:pointer; background:#4F46E5; color:white; border:none;">
            + Masukkan ke Keranjang
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openQuickAddToCart(product) {
  ensureQuickModalExists();
  quickModalProduct = product;
  quickModalSelectedSize = 'S';

  const modal = document.getElementById('quickAddModal');
  const img = document.getElementById('quickModalImg');
  const title = document.getElementById('quickModalTitle');
  const weight = document.getElementById('quickModalWeight');
  const qty = document.getElementById('quickModalQty');

  if (img) img.src = convertDriveUrl(product.foto);
  if (title) title.innerText = product.nama_series || product.nama;
  if (weight) weight.innerText = `(Berat: ${product.berat || '1kg'})`;
  if (qty) qty.value = '1';

  selectQuickSize('S');

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeQuickAddModal() {
  const modal = document.getElementById('quickAddModal');
  if (modal) modal.style.display = 'none';
}

function selectQuickSize(size) {
  quickModalSelectedSize = size;
  const buttons = document.querySelectorAll('.quick-size-btn');
  buttons.forEach(btn => {
    if (btn.innerText.trim() === size) {
      btn.style.border = '2px solid #4F46E5';
      btn.style.background = '#EEF2FF';
      btn.style.color = '#4F46E5';
    } else {
      btn.style.border = '1px solid #cbd5e1';
      btn.style.background = '#ffffff';
      btn.style.color = '#334155';
    }
  });

  if (quickModalProduct) {
    const price = getVariantPrice(quickModalProduct, size);
    const priceEl = document.getElementById('quickModalPrice');
    if (priceEl) priceEl.innerText = formatRupiah(price);
  }
}

function changeQuickQty(delta) {
  const input = document.getElementById('quickModalQty');
  if (input) {
    let val = (parseInt(input.value) || 1) + delta;
    if (val < 1) val = 1;
    input.value = val;
  }
}

function confirmQuickAddToCart() {
  if (!quickModalProduct) return;
  const qtyInput = document.getElementById('quickModalQty');
  const qty = parseInt(qtyInput?.value) || 1;
  const price = getVariantPrice(quickModalProduct, quickModalSelectedSize);

  const productToAdd = {
    ...quickModalProduct,
    harga: price
  };

  addToCart(productToAdd, qty, quickModalSelectedSize, 'Standard');
  closeQuickAddModal();
}

function getTotalCartWeight() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + ((parseBeratToGram(item.berat) || 1000) * item.qty), 0);
  return total > 0 ? total : 1000;
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
  const badgeElements = document.querySelectorAll('.icon-btn--cart .count');
  badgeElements.forEach(badge => {
    badge.textContent = totalCount;
  });
}
const updateCartCount = updateCartBadge;

// =========================================================================
// 2. VALIDASI FORM & KONTROL STATUS TOMBOL CHECKOUT (SECURITY & UX)
// =========================================================================

function updateCheckoutButtonState() {
  const btn = document.getElementById('btnCheckoutWA') || document.querySelector('button[onclick="checkoutToWhatsApp()"]');
  if (!btn) return;

  const cart = getCart();

  // Kondisi 1: Keranjang masih kosong
  if (cart.length === 0) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    btn.style.pointerEvents = "none";
    btn.style.background = "#94a3b8";
    btn.innerText = "Keranjang Belanja Kosong";
    return;
  }

  // Kondisi 2: Sedang menghitung tarif ongkir JNE
  if (isCalculatingOngkir) {
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";
    btn.style.pointerEvents = "none";
    btn.style.background = "#6366f1";
    btn.innerText = "⏳ Sedang Menghitung Ongkir JNE...";
    return;
  }

  // Kondisi 3: Cek kelengkapan seluruh form
  const name = document.getElementById('custName')?.value.trim() || "";
  const phone = document.getElementById('custPhone')?.value.trim() || "";
  const city = document.getElementById('custCity')?.value.trim() || "";
  const cityId = document.getElementById('custCityId')?.value.trim() || "";
  const subdistrict = document.getElementById('custSubdistrict')?.value.trim() || "";
  const address = document.getElementById('custAddress')?.value.trim() || "";

  const isFormComplete = name.length > 0 && 
                         phone.length >= 7 && 
                         city.length > 0 && 
                         cityId.length > 0 && 
                         subdistrict.length > 0 && 
                         address.length > 0 && 
                         currentEstimatedOngkir > 0;

  if (!isFormComplete) {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    btn.style.pointerEvents = "none";
    btn.style.background = "#94a3b8";

    if (!name || !phone || !subdistrict || !address) {
      btn.innerText = "⚠️ Lengkapi Data Pemesan & Alamat";
    } else if (!cityId || currentEstimatedOngkir <= 0) {
      btn.innerText = "⚠️ Ketik Kota/Kabupaten Valid";
    } else {
      btn.innerText = "⚠️ Lengkapi Form Pengiriman";
    }
    return;
  }

  // Kondisi 4: Semua valid & siap checkout!
  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
  btn.style.pointerEvents = "auto";
  btn.style.background = "#25D366";
  btn.innerText = "Checkout via WhatsApp →";
}

// =========================================================================
// 3. LOGIKA PENDAFTARAN KOTA & ONGKIR REAL-TIME (KHUSUS JNE EXPRESS)
// =========================================================================

let citySearchTimeout;

async function handleCityInput(cityName) {
  const custCityId = document.getElementById('custCityId');
  const zipLoading = document.getElementById('zipLoading');
  const cleanCity = cityName ? cityName.trim() : '';

  if (cleanCity.length < 3) {
    if (custCityId) custCityId.value = "";
    currentEstimatedOngkir = 0;
    isCalculatingOngkir = false;
    renderCartTotals();
    updateCheckoutButtonState();
    return;
  }

  isCalculatingOngkir = true;
  updateCheckoutButtonState();

  clearTimeout(citySearchTimeout);

  citySearchTimeout = setTimeout(async () => {
    if (zipLoading) {
      zipLoading.style.display = "block";
      zipLoading.innerText = "⏳ Mencari kota & menghitung ongkir JNE...";
    }

    try {
      // 1. Panggil Apps Script untuk cari ID Kota
      const res = await fetch(`${GSHEET_API_ongkir_URL}?search_city=${encodeURIComponent(cleanCity)}`);
      const data = await res.json();

      if (data && data.status && data.city_id) {
        if (custCityId) custCityId.value = data.city_id;
        await fetchRealOngkir();
      } else {
        // Fallback jika pencarian spesifik gagal
        const simplifiedCity = cleanCity.replace(/kota|kabupaten|kab/gi, '').trim();
        const fallbackRes = await fetch(`${GSHEET_API_ongkir_URL}?search_city=${encodeURIComponent(simplifiedCity)}`);
        const fallbackData = await fallbackRes.json();

        if (fallbackData && fallbackData.status && fallbackData.city_id) {
          if (custCityId) custCityId.value = fallbackData.city_id;
          await fetchRealOngkir();
        } else {
          if (custCityId) custCityId.value = "";
          currentEstimatedOngkir = 0;
          isCalculatingOngkir = false;
          renderCartTotals();
        }
      }
    } catch (err) {
      console.error("Gagal cari ID kota:", err);
      currentEstimatedOngkir = 0;
      isCalculatingOngkir = false;
      renderCartTotals();
    } finally {
      if (zipLoading) zipLoading.style.display = "none";
      updateCheckoutButtonState();
    }
  }, 400);
}

async function fetchRealOngkir() {
  const cityIdInput = document.getElementById('custCityId');
  const cityId = cityIdInput ? cityIdInput.value : null;
  const shippingElement = document.getElementById('summaryShippingPrice');
  const cart = getCart();

  // Jika keranjang kosong atau kota belum diisi
  if (cart.length === 0 || !cityId) {
    currentEstimatedOngkir = 0;
    isCalculatingOngkir = false;
    renderCartTotals();
    updateCheckoutButtonState();
    return;
  }

  isCalculatingOngkir = true;
  updateCheckoutButtonState();

  if (shippingElement) {
    shippingElement.innerText = "⏳ Menghitung JNE...";
  }

  const totalWeight = getTotalCartWeight();

  try {
    const response = await fetch(GSHEET_API_ongkir_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        destination_city: cityId,
        weight: totalWeight,
        courier: "jne"
      })
    });

    const responseText = await response.text();

    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      throw new Error("Apps Script response HTML error");
    }

    const result = JSON.parse(responseText);

    // Cek hasil biaya dari RajaOngkir / Komerce
    if (result && result.rajaongkir && result.rajaongkir.results && result.rajaongkir.results.length > 0) {
      const costs = result.rajaongkir.results[0].costs;
      if (costs && costs.length > 0 && costs[0].cost && costs[0].cost.length > 0) {
        currentEstimatedOngkir = costs[0].cost[0].value || 0;
      } else {
        currentEstimatedOngkir = 0;
      }
    } else if (result && result.raw_komerce && result.raw_komerce.data && result.raw_komerce.data.length > 0) {
      currentEstimatedOngkir = result.raw_komerce.data[0].cost || 0;
    } else {
      currentEstimatedOngkir = 0;
    }
  } catch (err) {
    console.error("Gagal ambil ongkir:", err);
    currentEstimatedOngkir = 0;
  } finally {
    isCalculatingOngkir = false;
  }

  renderCartTotals();
  updateCheckoutButtonState();
}

// =========================================================================
// 4. RENDER TOTAL, LIST KERANJANG & CHECKOUT WHATSAPP
// =========================================================================

function renderCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + ((parseInt(item.harga) || 0) * (parseInt(item.qty) || 1)), 0);
  const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
  const cityId = document.getElementById('custCityId')?.value;
  const grandTotal = subtotal + (cart.length > 0 ? currentEstimatedOngkir : 0);

  const summaryQty = document.getElementById('summaryTotalQty');
  const summarySubtotal = document.getElementById('summarySubtotalPrice');
  const summaryShipping = document.getElementById('summaryShippingPrice');
  const summaryTotal = document.getElementById('summaryTotalPrice');

  if (summaryQty) summaryQty.innerText = `${totalQty} Item`;
  if (summarySubtotal) summarySubtotal.innerText = formatRupiah(subtotal);
  
  if (summaryShipping) {
    if (cart.length === 0) {
      summaryShipping.innerText = "Rp 0";
    } else if (isCalculatingOngkir) {
      summaryShipping.innerText = "⏳ Menghitung JNE...";
    } else if (currentEstimatedOngkir > 0) {
      const weightKg = (getTotalCartWeight() / 1000).toFixed(1).replace('.0', '');
      summaryShipping.innerText = `${formatRupiah(currentEstimatedOngkir)} (${weightKg} kg - JNE)`;
    } else {
      summaryShipping.innerText = cityId ? "Rp 0" : "Rp 0 (Ketik Kota/Kab)";
    }
  }

  if (summaryTotal) summaryTotal.innerText = formatRupiah(grandTotal);
  updateCheckoutButtonState();
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const cartSubtitle = document.getElementById('cartSummarySubtitle');
  if (!cartList) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center; padding: 40px; background:#f8fafc; border-radius:8px;">
        <h3 style="margin-bottom: 8px;">Keranjang belanja Anda masih kosong</h3>
        <p style="margin-top:10px;"><a href="shop.html" class="btn">Lihat Produk Kami</a></p>
      </div>
    `;
    if (cartSubtitle) cartSubtitle.innerText = "0 item di keranjang Anda.";
    currentEstimatedOngkir = 0;
    renderCartTotals();
    updateCheckoutButtonState();
    return;
  }

  const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
  if (cartSubtitle) cartSubtitle.innerText = `${totalQty} item dalam keranjang belanja Anda.`;

  let listHtml = '';
  cart.forEach((item, index) => {
    const priceNum = parseInt(item.harga) || 0;
    const qtyNum = parseInt(item.qty) || 1;
    const itemSubtotal = priceNum * qtyNum;
    const imgUrl = convertDriveUrl(item.foto);

    listHtml += `
      <article class="cart-row" style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
        <div class="pic">
          <img src="${imgUrl}" alt="${item.nama || item.nama_series}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://placehold.co/200?text=Produk';" />
        </div>
        <div class="info" style="flex: 1;">
          <div class="name" style="font-weight: 700;">${item.nama || item.nama_series}</div>
          <div class="variant" style="font-size: 13px; color: #64748b;">Ukuran: ${item.size || 'All Size'} | Variant: ${item.color || 'Standard'} | Berat: ${(parseBeratToGram(item.berat)/1000)} kg</div>
          <div style="font-weight: 600; color: #4F46E5; margin-top: 4px;">${formatRupiah(priceNum)}</div>
        </div>
        <div class="qty" style="display: flex; align-items: center; gap: 6px;">
          <button type="button" onclick="changeQty(${index}, -1)" style="padding: 4px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc;">−</button>
          <input type="text" value="${qtyNum}" readonly style="width: 36px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 0;" />
          <button type="button" onclick="changeQty(${index}, 1)" style="padding: 4px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc;">+</button>
        </div>
        <span class="subtotal" style="font-weight: 700; min-width: 90px; text-align: right;">${formatRupiah(itemSubtotal)}</span>
        <button type="button" onclick="removeItem(${index})" class="remove" style="background: none; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0 8px;" title="Hapus Item">✕</button>
      </article>
    `;
  });

  cartList.innerHTML = listHtml;
  renderCartTotals();
  updateCheckoutButtonState();
}

function changeQty(index, delta) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].qty = (parseInt(cart[index].qty) || 1) + delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);

    // Otomatis hitung ulang ongkir JNE jika kota sudah terisi
    const cityId = document.getElementById('custCityId')?.value;
    if (cityId && cart.length > 0) {
      fetchRealOngkir();
    } else {
      if (cart.length === 0) currentEstimatedOngkir = 0;
      renderCartTotals();
      updateCheckoutButtonState();
    }
  }
}

function removeItem(index) {
  let cart = getCart();
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);

    const cityId = document.getElementById('custCityId')?.value;
    if (cityId && cart.length > 0) {
      fetchRealOngkir();
    } else {
      currentEstimatedOngkir = 0;
      renderCartTotals();
      updateCheckoutButtonState();
    }
  }
}

function clearCart() {
  if (confirm("Apakah Anda yakin ingin mengosongkan keranjang belanja?")) {
    localStorage.removeItem('makka_cart');
    currentEstimatedOngkir = 0;
    updateCartBadge();
    renderCart();
    updateCheckoutButtonState();
  }
}

// FORMAT PESAN WHATSAPP SESUAI PERMINTAAN
function checkoutToWhatsApp() {
  if (isCalculatingOngkir) {
    alert("Mohon tunggu sebentar, sistem sedang menghitung tarif ongkir JNE...");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) return alert("Keranjang belanja kamu masih kosong!");

  const name = document.getElementById('custName')?.value.trim();
  const phone = document.getElementById('custPhone')?.value.trim();
  const city = document.getElementById('custCity')?.value.trim();
  const cityId = document.getElementById('custCityId')?.value.trim();
  const subdistrict = document.getElementById('custSubdistrict')?.value.trim();
  const address = document.getElementById('custAddress')?.value.trim();
  const zip = document.getElementById('custZip')?.value.trim() || "-";

  if (!name || !phone || !city || !subdistrict || !address) {
    return alert("Mohon lengkapi semua data pemesan dan alamat pengiriman!");
  }

  if (!cityId || currentEstimatedOngkir <= 0) {
    return alert("Mohon pilih kota tujuan yang valid agar ongkos kirim JNE dapat dihitung!");
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  const totalWeightGram = getTotalCartWeight();
  const totalWeightKg = (totalWeightGram / 1000).toFixed(1).replace('.0', '');
  const grandTotal = subtotal + currentEstimatedOngkir;

  let msg = `Halo Admin Makka, saya mau memesan produk berikut:\n\n`;

  // List Produk
  cart.forEach((item, i) => {
    msg += `${i + 1}. *${item.nama}*\n`;
    msg += `   - Ukuran: ${item.size}\n`;
    msg += `   - Variant: ${item.color}\n`;
    msg += `   - Jumlah: ${item.qty} x ${formatRupiah(item.harga)} = ${formatRupiah(item.harga * item.qty)}\n\n`;
  });

  // Data Pengiriman
  msg += `Nama Pemesan : ${name}\n`;
  msg += `Telepon : ${phone}\n`;
  msg += `Kota / Kab : ${city}\n`;
  msg += `Kecamatan/Kelurahan : ${subdistrict}\n`;
  msg += `Alamat Lengkap : ${address}\n`;
  msg += `Kode Pos : ${zip}\n`;
  msg += `Total Berat : ${totalWeightKg} kg\n`;
  msg += `Ekspedisi : JNE Express (Reguler)\n\n`;

  // Total
  msg += `Subtotal Produk : ${formatRupiah(subtotal)}\n`;
  msg += `Ongkos Kirim : ${formatRupiah(currentEstimatedOngkir)}\n`;
  msg += `*Total Pembayaran: ${formatRupiah(grandTotal)}*\n\n`;
  msg += `Mohon diproses pesanan saya. Terima kasih!`;

  const adminWA = "6282113145513"; // Nomor WhatsApp Admin Toko
  window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Inisialisasi awal saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();

  // Pasang listener di semua form input pengiriman agar tombol realtime update
  const formInputs = ['custName', 'custPhone', 'custCity', 'custSubdistrict', 'custAddress', 'custZip'];
  formInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateCheckoutButtonState);
      el.addEventListener('change', updateCheckoutButtonState);
      el.addEventListener('blur', updateCheckoutButtonState);
    }
  });

  updateCheckoutButtonState();
});