const DB = "https://kirana-pro-default-rtdb.firebaseio.com/";
let cart = {};

// AI TRENDS & HAPTICS (Point 201, 215)
function initPremium() {
    setInterval(() => {
        const t = ["Trending: Amul Milk 🥛", "Viral: Maggi Spicy 🍜", "Stock Alert: Chips 🍟"];
        const msg = t[Math.floor(Math.random()*t.length)];
        const toast = document.createElement('div');
        toast.className = "bg-white p-3 rounded-xl shadow-2xl border-l-4 border-yellow-400 fixed top-24 right-4 z-[2000] text-[10px] font-bold animate-bounce";
        toast.innerHTML = `<i class="fa-solid fa-robot mr-2"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }, 15000);
}

// LOAD PRODUCTS
async function load() {
    const res = await fetch(DB + ".json");
    const data = await res.json() || {};
    const grid = document.getElementById('productGrid');
    grid.innerHTML = "";
    for(let id in data) {
        if(id === "orders" || id === "settings") continue;
        grid.innerHTML += `
        <div class="bg-white p-3 rounded-2xl border border-gray-100 product-node" data-name="${data[id].name}">
            <div class="bg-gray-50 rounded-xl mb-2 h-28 flex items-center justify-center p-2">
                <img src="${data[id].image}" class="h-full object-contain">
            </div>
            <h3 class="text-[10px] font-black h-8 overflow-hidden">${data[id].name}</h3>
            <div class="flex justify-between items-center mt-2">
                <span class="text-sm font-black">₹${data[id].price}</span>
                <div id="btn-${id}"><button onclick="updateCart('${id}','${data[id].name}',${data[id].price},1)" class="bg-[#f0faf1] text-[#0c831f] border border-[#0c831f] px-4 py-1 rounded-lg font-black text-[10px]">ADD</button></div>
            </div>
        </div>`;
    }
}

function updateCart(id, name, p, d) {
    if(!cart[id]) cart[id] = { name, price: p, qty: 0 };
    cart[id].qty += d;
    if(cart[id].qty <= 0) delete cart[id];
    
    // Button Render
    const btn = document.getElementById(`btn-${id}`);
    if(cart[id]) btn.innerHTML = `<div class="bg-green-700 text-white rounded-lg flex items-center px-2 h-7 text-xs font-bold"><button onclick="updateCart('${id}','',0,-1)">-</button><span class="mx-2">${cart[id].qty}</span><button onclick="updateCart('${id}','',0,1)">+</button></div>`;
    else btn.innerHTML = `<button onclick="updateCart('${id}','','',1)" class="bg-[#f0faf1] text-[#0c831f] border border-[#0c831f] px-4 py-1 rounded-lg font-black text-[10px]">ADD</button>`;
    
    refresh();
}

function refresh() {
    let t = 0, q = 0;
    const list = document.getElementById('cartItemsList');
    list.innerHTML = "";
    for(let id in cart) {
        t += cart[id].price * cart[id].qty; q += cart[id].qty;
        list.innerHTML += `<div class="flex justify-between text-xs font-bold bg-gray-50 p-3 rounded-xl"><span>${cart[id].name} x ${cart[id].qty}</span><span>₹${cart[id].price * cart[id].qty}</span></div>`;
    }
    document.getElementById('cartBar').style.display = q > 0 ? 'flex' : 'none';
    document.getElementById('cQty').innerText = q + " ITEMS";
    document.getElementById('cPrice').innerText = "₹" + t;
    document.getElementById('grandTotal').innerText = "₹" + (t + 2);
}

// POINT 288: LIVE TRACKING
function startTrackingUI() {
    const track = document.getElementById('trackingUI');
    track.innerHTML = `
        <div class="tracking-card">
            <p class="text-[10px] text-yellow-400 font-black mb-2">● LIVE STATUS</p>
            <div id="st1" class="step-active text-xs mb-1">✓ Order Confirmed</div>
            <div id="st2" class="text-gray-500 text-[10px] mb-1">○ Rider Arriving at Store (2 min)</div>
            <div id="st3" class="text-gray-500 text-[10px]">○ Out for Delivery</div>
        </div>`;
    setTimeout(() => document.getElementById('st2').className = "step-active text-xs mb-1", 5000);
    setTimeout(() => document.getElementById('st3').className = "step-active text-xs mb-1", 10000);
}

async function handleCheckout() {
    confetti({ particleCount: 150 });
    const orderId = "ORD-" + Math.floor(Math.random()*9000);
    await fetch(DB + "orders/" + orderId + ".json", { method: 'PUT', body: JSON.stringify({id: orderId, items: cart, status: "Pending"}) });
    
    startTrackingUI(); // Point 288
    document.getElementById('checkoutBtn').innerText = "RIDER ASSIGNING...";
    
    setTimeout(() => {
        window.open(`https://wa.me/917240362145?text=New Order: ${orderId}`);
        cart = {}; refresh();
    }, 2000);
}

function toggleCart(s) {
    document.getElementById('cartDrawer').classList.toggle('open', s);
    document.getElementById('overlay').style.display = s ? 'block' : 'none';
}

document.getElementById('searchInput').onkeyup = (e) => {
    const v = e.target.value.toLowerCase();
    document.querySelectorAll('.product-node').forEach(n => n.style.display = n.dataset.name.toLowerCase().includes(v) ? 'block' : 'none');
}

window.onload = () => { setTimeout(() => { document.getElementById('splash').style.transform = 'translateY(-100%)'; load(); initPremium(); }, 2000); };
