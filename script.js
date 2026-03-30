// --- 1. KHỞI TẠO DỮ LIỆU ---
let courts = JSON.parse(localStorage.getItem('courts_v13')) || [];
if (courts.length === 0) {
    for (let i = 1; i <= 10; i++) {
        courts.push({ 
            id: i, name: `Sân ${i}`, 
            base: i <= 5 ? 100000 : 120000, 
            type: i <= 5 ? "Thường" : "VIP", 
            status: "available" 
        });
    }
    localStorage.setItem('courts_v13', JSON.stringify(courts));
}

const serviceItems = [
    {n:"Sting", p:20000}, {n:"Pocari", p:20000}, {n:"Mì Ly", p:20000}, 
    {n:"Thuê Vợt", p:30000}, {n:"Thuê Giày", p:30000}, 
    {n:"Nước suối", p:10000}, {n:"Bánh mỳ", p:25000}, {n:"Xúc xích", p:15000}
];

let cart = [];
let currentUser = localStorage.getItem('currentUser') || null;
let historyData = JSON.parse(localStorage.getItem('history_v13')) || [];

// --- 2. ĐIỀU HƯỚNG TAB ---
function openTab(id) {
    // Luôn đóng modal đăng nhập khi chuyển tab để tránh lỗi giao diện
    closeAuthModal(); 

    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    
    const target = document.getElementById(id);
    if (id === 'home') {
        target.style.display = 'flex';
    } else {
        target.style.display = 'block';
    }

    // Render dữ liệu tương ứng với tab
    if (id === 'booking') renderBooking();
    if (id === 'canteen') renderCanteen();
    if (id === 'history') renderHistoryTab();
    if (id === 'admin') renderAdmin();
}

// --- 3. GIAO DIỆN CANTEEN ---
function renderCanteen() {
    const canteenGrid = document.getElementById('service-grid-new');
    const items = [
        {n: "Sting Dâu", p: 15000, img: "🥤"},
        {n: "Pocari Sweat", p: 20000, img: "💧"},
        {n: "Mì Ly Modern", p: 20000, img: "🍜"},
        {n: "Xúc Xích Đức", p: 15000, img: "🌭"},
        {n: "Thuê Vợt", p: 30000, img: "🏸"},
        {n: "Thuê Giày", p: 30000, img: "👟"},
        {n: "Đan vợt", p: 100000, img: "🛠️"},
        {n: "Cầu Thành công/Vina", p: 21000, img: "🏸"},
        {n: "Quấn cán vợt", p: 15000, img: "🎗️"},
        {n: "Tất thể thao", p: 25000, img: "🧦"},
    ];

    if(canteenGrid) {
        canteenGrid.innerHTML = items.map(i => `
            <div class="card status-available">
                <div style="font-size: 40px;">${i.img}</div>
                <h3>${i.n}</h3>
                <p><b>${i.p.toLocaleString()}đ</b></p>
                <button class="btn-main" onclick="addToCart('${i.n}', ${i.p}, 'Dịch vụ')">Thêm vào giỏ</button>
            </div>
        `).join('');
    }
}

// --- 4. LOGIC ĐẶT SÂN ---
function getPrice() {
    const h = new Date().getHours();
    return (h >= 18 || h < 5); // Giờ cao điểm từ 18h tối đến 5h sáng
}

function renderBooking() {
    const isPeak = getPrice();
    const grid = document.getElementById('court-grid');
    if(!grid) return;

    grid.innerHTML = (isPeak ? `<p style="color:red; width:100%; text-align:center">🔥 Giờ cao điểm (Phụ thu 40k đèn)</p>` : "") + 
    courts.map(c => {
        const finalP = isPeak ? c.base + 40000 : c.base;
        let statusText = c.status === 'occupied' ? "Đang sử dụng" : (c.status === 'fix' ? "Bảo trì" : "Trống");

        return `<div class="card status-${c.status}">
            <small>${c.type}</small><h3>${c.name}</h3>
            <p><b>${finalP.toLocaleString()}đ/h</b></p>
            <p style="font-size:12px; margin-bottom:10px">${statusText}</p>
            <button class="btn-main" onclick="addToCart('${c.name}', ${finalP}, 'Sân', ${c.id})" ${c.status !== 'available' ? 'disabled' : ''}>
                ${c.status === 'available' ? 'Đặt Ngay' : 'Hết sân'}
            </button>
        </div>`;
    }).join('');

    // Render dịch vụ phụ dưới trang đặt sân (nếu có thẻ service-grid)
    const sGrid = document.getElementById('service-grid');
    if(sGrid) {
        sGrid.innerHTML = serviceItems.map(i => `
            <div class="card status-available"><h3>${i.n}</h3><p>${i.p.toLocaleString()}đ</p>
            <button class="btn-main" onclick="addToCart('${i.n}', ${i.p}, 'Dịch vụ')">Thêm món</button></div>
        `).join('');
    }
}

// --- 5. GIỎ HÀNG & THANH TOÁN ---
function addToCart(n, p, cat, id) {
    cart.push({n, p, cat, id});
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.length;
}

function renderHistoryTab() {
    const list = document.getElementById('cart-list');
    if(list) {
        list.innerHTML = cart.map((item, idx) => `
            <div class="admin-item"><span>${item.n}</span><span>${item.p.toLocaleString()}đ <b onclick="removeCart(${idx})" style="color:red; cursor:pointer">❌</b></span></div>
        `).join('') || "Chưa có món nào trong giỏ.";
        document.getElementById('cart-total').innerText = cart.reduce((s,i)=>s+i.p,0).toLocaleString();
    }

    const hBox = document.getElementById('history-list');
    if(hBox) {
        const myH = historyData.filter(h => h.user === currentUser);
        hBox.innerHTML = myH.reverse().map(h => `<div style="padding:10px; background:#eee; margin-bottom:5px; border-radius:5px"><small>${h.time}</small><br><b>${h.items}</b><br><span style="color:red">-${h.total.toLocaleString()}đ</span></div>`).join('');
    }
}

function removeCart(idx) { 
    cart.splice(idx,1); 
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.length; 
    renderHistoryTab(); 
}

function checkout() {
    if(!currentUser) return alert("Bạn vui lòng đăng nhập để thanh toán!");
    if(cart.length === 0) return alert("Giỏ hàng đang trống!");
    
    cart.forEach(item => { 
        if(item.id) { 
            let i = courts.findIndex(c => c.id === item.id); 
            if(i !== -1) courts[i].status = 'occupied'; 
        }
    });
    
    const bill = { 
        user: currentUser, 
        items: cart.map(i=>i.n).join(", "), 
        total: cart.reduce((s,i)=>s+i.p,0), 
        time: new Date().toLocaleString() 
    };
    historyData.push(bill);
    
    localStorage.setItem('history_v13', JSON.stringify(historyData));
    localStorage.setItem('courts_v13', JSON.stringify(courts));
    
    cart = []; 
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = 0;
    
    alert("Thanh toán thành công!"); 
    openTab('history');
}

// --- 6. QUẢN TRỊ (ADMIN) ---
function renderAdmin() {
    // 1. Tính tổng doanh thu tổng thể
    const rev = historyData.reduce((s, h) => s + h.total, 0);
    const revEl = document.getElementById('revenue-val');
    if (revEl) revEl.innerText = rev.toLocaleString() + "đ";

    // 2. Xử lý thống kê theo tháng
    const monthlyData = {};

    historyData.forEach(item => {
        // Cấu trúc item.time thường là "27/3/2026, 12:00:00"
        // Ta tách lấy phần "Tháng/Năm"
        const dateParts = item.time.split(',')[0].split('/');
        const monthYear = `Tháng ${dateParts[1]}/${dateParts[2]}`;

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { count: 0, total: 0 };
        }
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].total += item.total;
    });

    const reportBody = document.getElementById('monthly-report-body');
    if (reportBody) {
        // Chuyển object thành mảng và render ra bảng
        const rows = Object.keys(monthlyData).map(month => `
            <tr>
                <td><b>${month}</b></td>
                <td>${monthlyData[month].count} đơn</td>
                <td class="income-text">+${monthlyData[month].total.toLocaleString()}đ</td>
            </tr>
        `).join('');
        
        reportBody.innerHTML = rows || "<tr><td colspan='3' style='text-align:center'>Chưa có dữ liệu tháng nào</td></tr>";
    }

    // 3. Render quản lý sân (giữ nguyên code cũ của ní)
    const adminManage = document.getElementById('admin-manage');
    if (adminManage) {
        adminManage.innerHTML = courts.map(c => `
            <div class="admin-item">
                <span><b>${c.name}</b> (${c.status})</span>
                <div class="admin-btns">
                    <button class="btn-set-available" onclick="updateStatus(${c.id}, 'available')">Trống</button>
                    <button class="btn-set-occupied" onclick="updateStatus(${c.id}, 'occupied')">Sử dụng</button>
                    <button class="btn-set-fix" onclick="updateStatus(${c.id}, 'fix')">Bảo trì</button>
                </div>
            </div>
        `).join('');
    }
}

function updateStatus(id, newStatus) {
    let i = courts.findIndex(c => c.id === id);
    if(i !== -1) {
        courts[i].status = newStatus;
        localStorage.setItem('courts_v13', JSON.stringify(courts));
        renderAdmin();
        alert("Đã cập nhật " + courts[i].name);
    }
}

// --- 7. TÀI KHOẢN (AUTH) ---
function openAuthModal() { 
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex'; // Dùng 'flex' để các dòng CSS căn giữa ở trên có tác dụng
    }
}

function closeAuthModal() { 
    const modal = document.getElementById('auth-modal');
    if(modal) modal.style.display='none'; 
}

function goToRegister() { 
    closeAuthModal(); 
    openTab('register-tab'); 
}

function handleRegisterDirect() {
    const u = document.getElementById('reg-u').value.trim();
    const p = document.getElementById('reg-p').value.trim();
    const re = document.getElementById('reg-re').value.trim();

    if (!u || !p || !re) return alert("Bạn nhập thiếu thông tin!");
    if (p !== re) return alert("Mật khẩu nhập lại không khớp!");

    let accs = JSON.parse(localStorage.getItem('accs_v13')) || [{u: "admin", p: "123"}];

    if (accs.some(user => user.u.toLowerCase() === u.toLowerCase())) {
        alert("⚠️ Tên '" + u + "' đã có người đặt, bạn chọn vui lòng chọn tên khác!");
        return;
    }

    accs.push({ u: u, p: p });
    localStorage.setItem('accs_v13', JSON.stringify(accs));

    alert("🎉 Chúc mừng Bạn đã đăng ký thành công!");
    
    // Clear form
    document.getElementById('reg-u').value = "";
    document.getElementById('reg-p').value = "";
    document.getElementById('reg-re').value = "";

    // Về Home để ẩn trang đăng ký, sau đó mới hiện Modal Đăng Nhập ở giữa
    openTab('home');
    openAuthModal();
}

function handleAuth() {
    const u = document.getElementById('auth-u').value.trim();
    const p = document.getElementById('auth-p').value.trim();
    let accs = JSON.parse(localStorage.getItem('accs_v13')) || [{u:"admin", p:"123"}];
    
    if(accs.some(a => a.u === u && a.p === p)) { 
        localStorage.setItem('currentUser', u); 
        location.reload(); 
    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    alert("Đã đăng xuất!");
    location.reload(); 
}

// --- 8. KHỞI TẠO KHI MỞ TRANG ---
window.onload = () => {
    const userDisplay = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        if(userDisplay) userDisplay.innerText = "👤 " + currentUser;
        if(loginBtn) loginBtn.style.display = 'none';
        if(logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if(userDisplay) userDisplay.innerText = "Khách";
        if(loginBtn) loginBtn.style.display = 'inline-block';
        if(logoutBtn) logoutBtn.style.display = 'none';
    }
    openTab('home');
};