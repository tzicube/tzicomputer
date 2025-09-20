/* ====== TziComputer – app.js ====== */

/* --- tiền tệ --- */
const RATE_VND_TO_TWD = 0.0013;
const extractVND = s => Number(String(s || "").replace(/[^\d]/g, "")) || 0;
const vndToTwd = n => Math.round(n * RATE_VND_TO_TWD);
const formatTWD = n => `NT$ ${n.toLocaleString("en-US")}`;

/* --- Elements --- */
const hotGridEl     = document.getElementById("hotGrid");
const gridGamingEl  = document.getElementById("gridGaming");
const gridOfficeEl  = document.getElementById("gridOffice");
const gridWSEl      = document.getElementById("gridWS");

const sectionHot    = document.getElementById("sectionHot");
const sectionGaming = document.getElementById("sectionGaming");
const sectionOffice = document.getElementById("sectionOffice");
const sectionWS     = document.getElementById("sectionWS");

const searchResultsSec = document.getElementById("searchResults");
const gridResultsEl    = document.getElementById("grid");

const searchInput   = document.getElementById("searchInput");
const clearBtn      = document.getElementById("clearFilters");
const brandChecks   = [...document.querySelectorAll(".brand-filter")];
const purposeChecks = [...document.querySelectorAll(".purpose-filter")];

/* ===== helpers ===== */
const notHot      = p => !p.hot;
const sortByIdDesc = (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0);

function cardHTML(p){
  const priceTwd = formatTWD(vndToTwd(extractVND(p.price)));
  return `
    <a class="card" href="detail.html?id=${p.id}" data-product-id="${p.id}">
      <div class="thumb"><img loading="lazy" src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <h3 title="${p.name}">${p.name}</h3>
        <p class="price">${priceTwd}</p>
        <p class="meta">${p.brand} · ${(p.purpose||[]).join(", ")}</p>
      </div>
    </a>
  `;
}

/* ===== Render sections mặc định ===== */
function renderHot(){
  const all = [...(window.PRODUCTS || [])].sort(sortByIdDesc);
  const hotPicked = all.filter(x => x.hot).slice(0, 8); // ưu tiên có cờ hot
  hotGridEl.innerHTML = hotPicked.map(cardHTML).join("");
}
function renderGroup(purpose, mount){
  const list = (window.PRODUCTS || [])
    .filter(notHot) // không lấy hot
    .filter(p => Array.isArray(p.purpose) && p.purpose.includes(purpose))
    .sort(sortByIdDesc)
    .slice(0, 9);

  mount.innerHTML = list.map(cardHTML).join("");
}

/* ====== Search + Filter ====== */
function getActiveFilters(){
  const q = (searchInput?.value || "").trim().toLowerCase();

  const brands = brandChecks.filter(c => c.checked).map(c => c.value);
  const purposes = purposeChecks.filter(c => c.checked).map(c => c.value);

  return { q, brands, purposes, any: !!(q || brands.length || purposes.length) };
}

function passFilters(p, filters){
  // text
  if (filters.q){
    const hay = `${p.name} ${p.brand} ${p.cpu} ${p.gpu} ${p.ram} ${p.storage} ${p.display}`
      .toLowerCase();
    if (!hay.includes(filters.q)) return false;
  }
  // brand
  if (filters.brands.length){
    if (!filters.brands.includes(p.brand)) return false;
  }
  // purpose
  if (filters.purposes.length){
    const ok = (p.purpose || []).some(x => filters.purposes.includes(x));
    if (!ok) return false;
  }
  return true;
}

function renderResults(){
  const filters = getActiveFilters();

  if (!filters.any){
    // không có tìm kiếm / filter → hiện bố cục mặc định
    searchResultsSec.style.display = "none";
    sectionHot.style.display = "";
    sectionGaming.style.display = "";
    sectionOffice.style.display = "";
    sectionWS.style.display = "";
    hotGridEl.style.display = "";
    gridGamingEl.style.display = "";
    gridOfficeEl.style.display = "";
    gridWSEl.style.display = "";
    return;
  }

  // có filter/search → ẩn các section mặc định, chỉ show Results
  sectionHot.style.display = "none";
  sectionGaming.style.display = "none";
  sectionOffice.style.display = "none";
  sectionWS.style.display = "none";
  hotGridEl.style.display = "none";
  gridGamingEl.style.display = "none";
  gridOfficeEl.style.display = "none";
  gridWSEl.style.display = "none";

  const items = (window.PRODUCTS || [])
    .filter(notHot)                      // loại bỏ hot
    .filter(p => passFilters(p, filters))
    .sort(sortByIdDesc);

  gridResultsEl.innerHTML = items.length
    ? items.map(cardHTML).join("")
    : `<p class="empty">No laptops match your filters.</p>`;

  searchResultsSec.style.display = "";
}

/* ====== Events ====== */
searchInput?.addEventListener("input", renderResults);
[...brandChecks, ...purposeChecks].forEach(c => c.addEventListener("change", renderResults));

clearBtn?.addEventListener("click", () => {
  if (searchInput) searchInput.value = "";
  brandChecks.forEach(c => (c.checked = false));
  purposeChecks.forEach(c => (c.checked = false));
  renderResults(); // sẽ tự hiện lại bố cục mặc định
});

/* Lưu id khi click vào card (phục vụ detail.html) */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[data-product-id]');
  if (a) sessionStorage.setItem("lastProductId", a.dataset.productId);
});

/* ===== Init ===== */
renderHot();
renderGroup("Gaming", gridGamingEl);
renderGroup("Office", gridOfficeEl);
renderGroup("Workstation", gridWSEl);
renderResults(); // khởi động để đảm bảo trạng thái đúng
