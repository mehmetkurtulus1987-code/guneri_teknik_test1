// --- 1. GENEL GÜVENLİK AYARLARI ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.ctrlKey && [67, 86, 85, 83].includes(e.keyCode)) return false;
    if (e.keyCode === 123) return false;
};

// --- 2. KVKK MODAL ---
const modal = document.getElementById("kvkkModal");
function openKvkk() { if (modal) { modal.showModal(); document.body.style.overflow = "hidden"; } }
function closeKvkk() { if (modal) { modal.close(); document.body.style.overflow = "auto"; } }
if (modal) { modal.addEventListener("click", (e) => { if (e.target === modal) closeKvkk(); }); }

// --- 3. YEDEK PARÇA VERİ ÇEKME VE FİLTRELEME ---
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTIuvoE6Mdx-csDbY7ECBAadzc2d4R9SB3NFdcZy0CVoRP5LuhYl-ogCpGnPtXvnnSBi6_9FNTZQ-mA/pub?gid=0&single=true&output=csv';

async function yedekParcalariYukle() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);
        document.querySelectorAll('.parts-grid').forEach(grid => grid.innerHTML = '');

        rows.forEach((row) => {
            const cols = row.split(/[;,]/);
            if (cols.length < 7) return;
            const [isim, marka, klasor, kategoriID, fiyat, stok, resimAdi] = cols.map(c => c.trim().replace(/"/g, ''));
            const temizID = kategoriID.toLowerCase().replace(/\s/g, '');
            const targetGrid = document.querySelector(`#cat-${temizID} .parts-grid`);

            if (targetGrid) {
                // Universal klasör kontrolü
                const resimYolu = (klasor && klasor !== "") ? `/img/YedekParca/${klasor}/${resimAdi}` : `/img/YedekParca/${resimAdi}`;
                const isAvailable = stok.toLowerCase() === 'var';
                const stokMetni = isAvailable ? 'Stokta Var' : 'Stokta Yok';
                const stokClass = isAvailable ? 'in-stock' : 'out-of-stock';

                targetGrid.innerHTML += `
                <div class="part-item" data-category="${temizID}">
                    <div class="part-img">
                        <img src="${resimYolu}" 
                             alt="${isim} - ${marka} Kombi Yedek Parça - Güneri Teknik" 
                             loading="lazy"
                             onerror="this.src='/img/placeholder.jpg'" 
                             onclick="openLightbox('${resimYolu}', '${isim}')">
                    </div>
                    <div class="part-details">
                        <h3>${isim}</h3>
                        <p class="compatible-brands">Marka: ${marka}</p>
                        <div class="part-price-row">
                            <span class="price">${fiyat}</span>
                        </div>
                        <div class="stock-info">
                            <span class="stock-status ${stokClass}">${stokMetni}</span>
                        </div>
                        <button class="order-btn" onclick="window.open('https://wa.me/905376183344?text=Merhaba, *${encodeURIComponent(isim)}* hakkında fiyat bilgisi alabilir miyim?', '_blank')">Fiyat Al</button>
                    </div>
                </div>`;
            }
        });
        updateCategoryVisibility();
    } catch (e) { 
        console.error("Hata:", e); 
    }
}

function filterCategory(category) {
    let buttons = document.getElementsByClassName('filter-btn');
    for (let btn of buttons) btn.classList.remove('active');
    if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('active');

    let items = document.getElementsByClassName('part-item');
    for (let i = 0; i < items.length; i++) {
        let itemCat = items[i].getAttribute('data-category');
        items[i].style.display = (category === 'all' || itemCat === category) ? "block" : "none";
    }
    updateCategoryVisibility();
}

function searchParts() {
    let inputEl = document.getElementById('partSearch');
    let clearBtn = document.getElementById('clearSearch');
    if (!inputEl) return;
    let input = inputEl.value.toLocaleLowerCase('tr-TR');
    let items = document.getElementsByClassName('part-item');
    if (clearBtn) clearBtn.style.display = (input.length > 0) ? "block" : "none";

    for (let i = 0; i < items.length; i++) {
        let title = items[i].querySelector('h3').innerText.toLocaleLowerCase('tr-TR');
        let brands = items[i].querySelector('.compatible-brands').innerText.toLocaleLowerCase('tr-TR');
        items[i].style.display = (title.includes(input) || brands.includes(input)) ? "block" : "none";
    }
    updateCategoryVisibility();
}

function clearInput() {
    let inputEl = document.getElementById('partSearch');
    if (inputEl) { inputEl.value = ""; searchParts(); inputEl.focus(); }
}

function updateCategoryVisibility() {
    let categories = document.getElementsByClassName('part-category');
    for (let cat of categories) {
        let itemsInCat = cat.getElementsByClassName('part-item');
        let hasVisible = false;
        for (let item of itemsInCat) {
            if (item.style.display !== "none") {
                hasVisible = true;
                break;
            }
        }
        cat.style.display = hasVisible ? "block" : "none";
    }
}
// --- 4. İLETİŞİM SAYFASI MANTIĞI ---
function toggleFields() {
    const serviceSelect = document.getElementById('serviceSelect');
    const brandSelect = document.getElementById('brandSelect');
    const warrantySelect = document.getElementById('warrantySelect');
    if (!serviceSelect || !brandSelect) return;

    const service = serviceSelect.value;
    const brand = brandSelect.value;
    const warranty = warrantySelect?.value;

    const warrantyGroup = document.getElementById('warrantyGroup');
    const brandGroup = document.getElementById('brandGroup');
    const manualBrandGroup = document.getElementById('manualBrandGroup');
    const warrantyAlert = document.getElementById('warrantyAlert');
    const submitBtn = document.getElementById('submitBtn');

    let otherOption = brandSelect.querySelector('option[value="Diger"]');
    const markalar = { "Maktek": "0850 441 42 00", "Sanica": "0850 460 66 88", "Ariston": "444 92 31", "Hexel": "0850 346 29 29", "Dizayn": "0850 290 3434" };

    if (warrantyGroup) warrantyGroup.style.display = 'none';
    if (brandGroup) brandGroup.style.display = 'none';
    if (manualBrandGroup) manualBrandGroup.style.display = 'none';
    if (warrantyAlert) warrantyAlert.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'block';

    if (service === 'servis') {
        if (otherOption) otherOption.remove();
        if (brandGroup) brandGroup.style.display = 'block';
        if (warrantyGroup) warrantyGroup.style.display = 'block';
        if (brand === 'Diger') brandSelect.value = "";

        if (warranty === 'evet' && brand && brand !== "Diger") {
            const numara = markalar[brand] || "çağrı merkezini";
            const alertMsg = document.getElementById('alertMessage');
            if (alertMsg) alertMsg.innerHTML = `<b>${brand}</b> yetkili servisiyiz ancak yasal garanti süreci gereği önce çağrı merkezinden kayıt açtırmanız gerekmektedir.`;
            const callBtn = document.getElementById('callCenterBtn');
            if (callBtn) callBtn.href = "tel:" + numara.replace(/\s/g, '');
            if (warrantyAlert) warrantyAlert.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    } else if (service === 'bakim') {
        if (!otherOption) {
            const newOption = document.createElement('option');
            newOption.value = "Diger";
            newOption.text = "Diğer";
            brandSelect.add(newOption);
        }
        if (brandGroup) brandGroup.style.display = 'block';
        if (brand === 'Diger' && manualBrandGroup) manualBrandGroup.style.display = 'block';
    }
}

// --- 5. LIGHTBOX ---
function openLightbox(src, title) {
    const lb = document.getElementById('imageModal');
    const lbImg = document.getElementById('imgFull');
    const lbCap = document.getElementById('caption');
    
    if (lb && lbImg) {
        lb.style.display = "flex";
        lbImg.src = src;
        if (lbCap) lbCap.innerText = title;
        
        // Sayfanın arkada kaymasını engelle ama konumu bozma
        document.body.style.overflow = 'hidden'; 
    }
}

function closeLightbox() {
    const lb = document.getElementById('imageModal');
    if (lb) {
        lb.style.display = "none";
        
        // Kaydırma kilidini aç
        document.body.style.overflow = ''; 
    }
}
// --- 6. SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. TELEFON NUMARASI KISITLAMASI (RAKAM ZORUNLULUĞU)
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, ''); // Rakam dışındakileri sil
            if (this.value.length > 11) this.value = this.value.slice(0, 11); // Max 11 hane
        });
    }

    // 2. YEDEK PARÇA OTOMATİK YÜKLEME (EĞER SAYFADAYSA)
    if (document.querySelector('.parts-grid')) {
        yedekParcalariYukle();
    }

    // 3. İLETİŞİM FORMU OLAYLARI
    ['serviceSelect', 'brandSelect', 'warrantySelect'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', toggleFields);
    });

    const cForm = document.getElementById('contactForm');
    if (cForm) {
        cForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('nameInput').value;
            const phone = document.getElementById('phoneInput').value;
            const service = document.getElementById('serviceSelect').value;
            const message = document.getElementById('messageInput').value;
            let selectedBrand = document.getElementById('brandSelect').value;

            if (selectedBrand === "Diger") selectedBrand = document.getElementById('manualBrandInput')?.value || "Diğer";

            // Numara Kontrolü
            if (!phone.startsWith('0') || phone.length !== 11) {
                alert("Numaranızı 0 ile başlayan 11 hane olarak giriniz.");
                return;
            }

            const scriptURL = 'https://script.google.com/macros/s/AKfycbwTcZuAo3VF1PZozQr2MTA9jwD2r_4PpjwulnWX4wz1vlMEW57qZZZkB9o5gtiP0kOpMQ/exec';
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('service', service);
            formData.append('brand', selectedBrand);
            formData.append('message', message);

            fetch(scriptURL, { method: 'POST', body: formData });

            const metin = `*Güneri Teknik Web Talebi*%0A*Müşteri:* ${name}%0A*Tel:* ${phone}%0A*Cihaz:* ${selectedBrand}%0A*Hizmet:* ${service}%0A*Mesaj:* ${message}`;
            window.open(`https://wa.me/905376183344?text=${metin}`, '_blank');
        });
    }

    // Lightbox için resim dinleyicisi (Yüklenen resimler için delegasyon kullanılır)
    document.addEventListener('click', function (e) {
        if (e.target.closest('.part-img img')) {
            const img = e.target;
            const title = img.closest('.part-item').querySelector('h3').innerText;
            openLightbox(img.src, title);
        }
    });

    document.addEventListener('keydown', (e) => { if (e.key === "Escape") closeLightbox(); });
});
