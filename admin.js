// --- AUTHENTICATION (MOCK) ---
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin') {
        document.getElementById('login-modal').style.display = 'none';
        const mainUI = document.getElementById('main-ui');
        mainUI.style.filter = 'none';
        loadDashboard();
    } else {
        alert('ACCESS_DENIED: INVALID_CREDENTIALS');
    }
}

function logout() {
    location.reload();
}

// --- DASHBOARD LOGIC ---

function switchView(viewName, navElement) {
    // Update Nav
    if (navElement) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        navElement.classList.add('active');
    }

    // Hide all sections first
    document.getElementById('section-stats').style.display = 'none';
    document.getElementById('section-bookings').style.display = 'none';
    document.getElementById('section-settings').style.display = 'none';

    // Show based on view
    if (viewName === 'dashboard') {
        document.getElementById('page-title').innerText = 'MISSION CONTROL';
        document.getElementById('section-stats').style.display = 'grid';
        document.getElementById('section-bookings').style.display = 'block';
    } else if (viewName === 'bookings') {
        document.getElementById('page-title').innerText = 'BOOKING MANIFEST';
        document.getElementById('section-bookings').style.display = 'block';
    } else if (viewName === 'settings') {
        document.getElementById('page-title').innerText = 'SYSTEM CONFIGURATION';
        document.getElementById('section-settings').style.display = 'grid'; // Using grid for the new layout
    }
}

function loadDashboard() {
    updateStats();
    renderTable();
}

function updateStats() {
    const stats = dataManager.getStats();

    // Animate numbers
    animateValue('stat-total', 0, stats.total, 1000);
    animateValue('stat-pending', 0, stats.pending, 1000);

    // Format revenue
    const revenueFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.revenue);
    document.getElementById('stat-revenue').innerText = revenueFormatted;
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderTable() {
    const bookings = dataManager.getBookings().reverse(); // Newest first
    const tbody = document.getElementById('booking-table-body');
    tbody.innerHTML = '';

    bookings.forEach(booking => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: 'Share Tech Mono'">${booking.id}</td>
            <td>${booking.date}</td>
            <td>
                <div style="font-weight: bold;">${booking.name}</div>
                <div style="font-size: 0.8rem; color: #8892b0;">${booking.email}</div>
            </td>
            <td>${booking.package === 'basic' ? 'Basic' : 'Premium'}</td>
            <td>${booking.pax}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
            <td>
                ${booking.status === 'pending' ? `<button class="action-btn" onclick="updateStatus('${booking.id}', 'confirmed')">CONFIRM</button>` : ''}
                <button class="action-btn btn-delete" onclick="deleteBooking('${booking.id}')">DELETE</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- SETTINGS ACTIONS ---
function toggleSwitch(element, systemName) {
    element.classList.toggle('active');
    const isActive = element.classList.contains('active');
    const log = document.getElementById('system-log');

    // Log to console
    const timestamp = new Date().toLocaleTimeString();
    const status = isActive ? 'ACTIVATED' : 'DEACTIVATED';
    log.innerHTML += `> [${timestamp}] ${systemName.toUpperCase()}_SYSTEM ${status}... OK<br>`;
    log.scrollTop = log.scrollHeight; // Auto scroll to bottom
}

// --- ACTIONS ---

window.updateStatus = function (id, status) {
    if (dataManager.updateBookingStatus(id, status)) {
        loadDashboard(); // Refresh UI
    }
};

window.deleteBooking = function (id) {
    if (confirm('WARNING: PERMANENT DELETION. CONFIRM?')) {
        dataManager.deleteBooking(id);
        loadDashboard();
    }
};

// Expose functions to window
window.login = login;
window.logout = logout;
window.switchView = switchView;
window.loadDashboard = loadDashboard;
window.toggleSwitch = toggleSwitch;

console.log('Admin script loaded');
