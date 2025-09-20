/* ========== TziComputer - orders.js ========== */
const LS_KEY = 'preorders';

/* LocalStorage */
function getPreorders(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch{ return []; } }
function savePreorders(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function savePreorder(order){ const list=getPreorders(); list.unshift(order); savePreorders(list); }
function removePreorder(id){ const list=getPreorders().filter(o=>String(o.id)!==String(id)); savePreorders(list); }

/* Badge on floating cart */
function updatePreordersBadge(){
  const n = getPreorders().length;
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  if (n>0){ badge.style.display='flex'; badge.textContent=String(n); }
  else { badge.style.display='none'; }
}

/* Open/close panel */
function openPreordersPanel(){
  const modal=document.getElementById('preordersModal'); if(!modal) return;
  const list=getPreorders(); const body=modal.querySelector('.orders-body');

  body.innerHTML = list.length ? list.map(o=>{
    let img=''; try{ img=(PRODUCTS.find(p=>String(p.id)===String(o.productId))||{}).image||''; }catch{}
    return `
      <div class="order-row">
        <div class="order-thumb">${img?`<img src="${img}" alt="">`:''}</div>
        <div class="order-main">
          <div class="order-title">${o.productName}</div>
          <div class="order-sub">
            <span><strong>Name:</strong> ${o.name}</span>
            <span><strong>Phone:</strong> ${o.phone}</span>
            <span><strong>Pickup:</strong> ${o.pickup||'-'}</span>
          </div>
          <div class="order-sub">
            <span><strong>Address:</strong> ${o.address}</span>
            <span><strong>Price:</strong> ${o.price||''}</span>
            ${o.orderCode ? `<span><strong>Order ID:</strong> ${o.orderCode}</span>` : ''}
          </div>
        </div>
        <button class="btn-mini danger" data-id="${o.id}">Remove</button>
      </div>
    `;
  }).join('') : `<p class="empty">No orders yet.</p>`;

  // delete -> -1
  body.querySelectorAll('.btn-mini.danger').forEach(b=>{
    b.addEventListener('click',()=>{
      removePreorder(b.dataset.id);
      updatePreordersBadge();
      openPreordersPanel(); // re-render
    });
  });

  modal.classList.add('show');
}
function closePreordersPanel(){ document.getElementById('preordersModal')?.classList.remove('show'); }

/* Events */
document.getElementById('floatingCart')?.addEventListener('click', openPreordersPanel);
document.getElementById('closePreorders')?.addEventListener('click', closePreordersPanel);

/* Helper: add current order (so badge +1) */
function addCurrentOrderToCart(order){ savePreorder(order); updatePreordersBadge(); }

/* Init */
updatePreordersBadge();
