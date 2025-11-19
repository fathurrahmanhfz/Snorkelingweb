// --- THREE.JS BACKGROUND (Simplified for Booking Page) ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x001e4d, 0.02); // Deep blue fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, -10, 20); // Underwater view

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const waterLight = new THREE.PointLight(0x00ffff, 1, 100);
waterLight.position.set(0, 10, 10);
scene.add(waterLight);

// Particles (Bubbles)
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.1, color: 0x88ccff, transparent: true, opacity: 0.8
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y += 0.001;
    particlesMesh.position.y += 0.02;
    if (particlesMesh.position.y > 20) particlesMesh.position.y = -20;
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- FORM LOGIC ---

let currentStep = 1;
const totalSteps = 3;

function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    currentStep = step;
}

function nextStep(step) {
    if (validateStep(currentStep)) {
        showStep(step);
        if (step === 3) updateSummary();
    }
}

function prevStep(step) {
    showStep(step);
}

function validateStep(step) {
    if (step === 1) {
        const date = document.getElementById('date').value;
        const pkg = document.getElementById('selected-package').value;
        if (!date) { alert('Silakan pilih tanggal keberangkatan.'); return false; }
        if (!pkg) { alert('Silakan pilih paket.'); return false; }
    }
    if (step === 2) {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        if (!name || !email || !phone) { alert('Mohon lengkapi data diri.'); return false; }
    }
    return true;
}

function selectPackage(pkgName, price) {
    document.querySelectorAll('.package-card').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    document.getElementById('selected-package').value = pkgName;
    document.getElementById('selected-price').value = price;
    updateTotal();
}

function updateTotal() {
    const price = parseInt(document.getElementById('selected-price').value) || 0;
    const pax = parseInt(document.getElementById('pax').value) || 1;
    const total = price * pax;
    // Store for summary
    window.currentTotal = total;
}

function updateSummary() {
    const pkg = document.getElementById('selected-package').value;
    const date = document.getElementById('date').value;
    const pax = document.getElementById('pax').value;

    document.getElementById('summary-package').innerText = pkg === 'basic' ? 'Basic Dive' : 'Sunset Premium';
    document.getElementById('summary-date').innerText = date;
    document.getElementById('summary-pax').innerText = pax + ' Orang';
    document.getElementById('summary-total').innerText = 'IDR ' + window.currentTotal.toLocaleString('id-ID');
}

// Handle Submit
document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const bookingData = {
        package: document.getElementById('selected-package').value,
        date: document.getElementById('date').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        pax: parseInt(document.getElementById('pax').value),
        price: window.currentTotal
    };

    // Save using DataManager
    const newBooking = dataManager.createBooking(bookingData);

    if (newBooking) {
        alert('Booking Berhasil! ID Tiket Anda: ' + newBooking.id);
        window.location.href = 'index.html'; // Redirect to home
    }
});
