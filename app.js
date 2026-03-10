const DB_URL = "https://kirana-pro-default-rtdb.firebaseio.com/"; // Fixed URL for deeper access
let cart = {};

// 1. AI TREND ENGINE (Point 201-203, 301)
const trends = [
    "Trending: Amul Taaza Milk 🥛",
    "Viral in Beawar: Kurkure Solid Masti 🍿",
    "YouTube Alert: Cold Coffee craze! 🥤",
    "Fast Selling: Maggi 12-Pack 🍜"
];

function initAI() {
    setInterval(() => {
        const msg = trends[Math.floor(Math.random() * trends.length)];
        const toast = document.createElement('div');
        toast.className = "ai-toast bg-white shadow-2xl p-3 rounded-2xl flex items-center gap-3 border mb-3 animate-slide-in";
        toast.style.cssText = "animation: slideIn 0.5s ease-out; border-left: 4px solid #f7d150;";
        toast.innerHTML = `
            <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center"><i class="fa-solid fa-robot text-xs"></i></div>
            <p class="text-[10px] font-bold text-gray-800">${msg}</p>
        `;
        document.getElementById('aiNotifier').appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 5000);
    }, 12000);
}

// 2. LOAD PRODUCTS (Point 113, 271, 281)
async function fetchProducts() {
    const grid = document.getElementById('productGrid');
    try {
        const res = await fetch(DB_URL + ".json");
        const data = await res.json() || {};
        grid.innerHTML = ""; 

        for(let id in data) {
            if(id === "settings" || id === "orders") continue;
            grid.innerHTML += `
            <div class="item-card bg-white p-3 rounded-2xl border border-gray-100 product-node" data-name="${data[id].name}">
                <div class="relative bg-gray-50 rounded-xl mb-3 p-2 h-32 flex items-center justify-center">
                    <span class="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">9 mins</span>
                    <img src="${data[id].image}" class="h-full object-contain mix-blend-multiply">
                </div>
                <h3 class="text-[11px] font-black text-gray-800 leading-tight h-8 overflow-hidden">${data[id].name}</h3>
                <p class="text-[9px] font-bold text-gray-400 mb-3 italic">1 unit</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-16 font-black italic text-gray-900">₹${data[id].price}</span>
                    <div id="btn-${id}">
                        <button onclick="updateCart('${id}', '${data[id].name}', ${data[id].price}, 1)" class="bg-[#f0faf1] text-[#0c831f] border border-[#0c831f] px-5 py-1.5 rounded-xl font-black text-[11px] active:scale-90 transition-all">ADD</button>
                    </div>
                </div>
            </div>`;
        }
    } catch (e) { console.error("Data Load Failed", e); }
}

// 3. CART SYSTEM (Point 19-27)
function updateCart(id, name, price, delta) {
    if (window.navigator.vibrate) window.navigator.vibrate(10); 
    
    if(!cart[id]) cart[id] = { name, price, qty: 0 };
    cart[id].qty += delta;
    if(cart[id].qty <= 0) delete cart[id];
    
    renderCartButtons(id);
    updateCartUI();
}

function renderCartButtons(id) {
    const el = document.getElementById(`btn-${id}`);
    if(!el) return;
    if(cart[id]) {
        el.innerHTML = `
        <div class="flex items-center bg-[#0c831f] text-white rounded-xl h-8 w-20 justify-between px-1">
            <button onclick="updateCart('${id}', '', 0, -1)" class="w-6 font-black">-</button>
            <span class="text-xs font-black">${cart[id].qty}</span>
            <button onclick="updateCart('${id}', '', 0, 1)" class="w-6 font-black">+</button>
        </div>`;
    } else {
        el.innerHTML = `<button onclick="updateCart('${id}', '', 0, 1)" class="bg-[#f0faf1] text-[#0c831f] border border-[#0c831f] px-5 py-1.5 rounded-xl font-black text-[11px]">ADD</button>`;
    }
}

function updateCartUI() {
    let total = 0, count = 0;
    const list = document.getElementById('cartItemsList');
    list.innerHTML = "";

    for(let id in cart) {
        total += cart[id].price * cart[id].qty;
        count += cart[id].qty;
        list.innerHTML += `
        <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border mb-3">
            <p class="font-black text-xs text-gray-800">${cart[id].name} (x${cart[id].qty})</p>
            <p class="font-black text-xs">₹${cart[id].price * cart[id].qty}</p>
        </div>`;
    }

    document.getElementById('cartBar').style.display = count > 0 ? 'flex' : 'none';
    document.getElementById('cQty').innerText = `${count} ITEMS`;
    document.getElementById('cPrice').innerText = `₹${total}`;
    document.getElementById('subTotal').innerText = `₹${total}`;
    document.getElementById('grandTotal').innerText = `₹${total + 2}`;
}

// 4. CHECKOUT & RIDER SYNC (Point 251, 289)
async function handleCheckout() {
    // Patakhe phutna (Confetti)
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0c831f', '#f7d150', '#ffffff'] });

    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const orderData = {
        id: orderId,
        items: cart,
        total: document.getElementById('grandTotal').innerText,
        status: "Pending",
        customerLocation: "Beawar, Rajasthan",
        timestamp: new Date().toISOString()
    };

    // 312 Point Check: Order ko Rider App ke liye Firebase mein save karna
    try {
        await fetch(`${DB_URL}orders/${orderId}.json`, {
            method: 'PUT',
            body: JSON.stringify(orderData)
        });

        setTimeout(() => {
            let msg = `🚀 *ANNAPURNA MART: NEW ORDER*%0A*Order ID:* ${orderId}%0A---------------------------%0A`;
            for(let id in cart) {
                msg += `✅ ${cart[id].name} (${cart[id].qty}x)%0A`;
            }
            msg += `---------------------------%0A💰 *TOTAL BILL: ${orderData.total}*%0A📍 *Location:* Beawar%0A📦 *Status:* Rider Assigning...`;
            
            window.open(`https://wa.me/917240362145?text=${msg}`);
            
            // Notification for Customer
            alert(`Order ${orderId} placed! Rider is being assigned.`);
            
            // Reset Cart
            cart = {};
            updateCartUI();
            toggleCart(false);
            fetchProducts(); // Refresh buttons
        }, 800);

    } catch (e) {
        alert("Order failed! Please check internet.");
    }
}

function toggleCart(s) {
    document.getElementById('cartDrawer').classList.toggle('open', s);
    document.getElementById('overlay').style.display = s ? 'block' : 'none';
}

// 5. SEARCH LOGIC (Point 121, 223)
document.getElementById('searchInput').addEventListener('keyup', (e) => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll('.product-node').forEach(card => {
        card.style.display = card.dataset.name.toLowerCase().includes(val) ? 'flex' : 'none';
    });
});

// START APP
window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if(splash) splash.style.transform = 'translateY(-100%)';
        fetchProducts();
        initAI();
    }, 2500);
};
