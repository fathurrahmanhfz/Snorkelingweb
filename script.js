// --- HELPER: Procedural Texture Generator (Agar pasir terlihat nyata tanpa load file) ---
function createSandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = '#e6ccb3';
    ctx.fillRect(0, 0, 512, 512);

    // Noise spots
    for (let i = 0; i < 50000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#dcb38e' : '#f0e0d0';
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
}

// --- WEBGL CHECK ---
if (!window.WebGLRenderingContext) {
    const warning = document.createElement('div');
    warning.style.position = 'fixed';
    warning.style.top = '0';
    warning.style.left = '0';
    warning.style.width = '100%';
    warning.style.padding = '20px';
    warning.style.background = '#ff0000';
    warning.style.color = 'white';
    warning.style.textAlign = 'center';
    warning.style.zIndex = '9999';
    warning.innerHTML = 'Your browser does not support WebGL. Please use a modern browser.';
    document.body.appendChild(warning);
}

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// FOG LOGIC: Start with Sunset Haze, change to Deep Blue later
const fogColorAir = new THREE.Color(0xfeb47b); // Orange sunset
const fogColorWater = new THREE.Color(0x001e4d); // Deep blue
scene.fog = new THREE.FogExp2(fogColorAir, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 3, 15); // Posisi awal melihat horizon

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Warna lebih realistis
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

// --- LIGHTING (SUNSET) ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Sedikit terang
scene.add(ambientLight);

// Matahari (Directional)
const sunLight = new THREE.DirectionalLight(0xffaa00, 1.5);
sunLight.position.set(0, 10, -50);
sunLight.castShadow = true;
scene.add(sunLight);

// Cahaya pantulan air (biru dari bawah)
const waterLight = new THREE.PointLight(0x00ffff, 1, 100);
waterLight.position.set(0, -10, 10);
scene.add(waterLight);

// Visual Matahari (Bola bersinar di horizon)
const sunGeo = new THREE.SphereGeometry(20, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(0, 10, -80); // Jauh di belakang
scene.add(sunMesh);

// Efek Glow Matahari (Simple Sprite)
const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture((() => {
        const c = document.createElement('canvas'); c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255, 200, 100, 1)');
        g.addColorStop(0.5, 'rgba(255, 100, 50, 0.4)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
        return c;
    })()),
    color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending
});
const sunGlow = new THREE.Sprite(spriteMaterial);
sunGlow.scale.set(100, 100, 1);
sunMesh.add(sunGlow);

// --- OCEAN SURFACE ---
const waterGeometry = new THREE.PlaneGeometry(300, 300, 128, 128);
// MeshPhysicalMaterial untuk efek air yang "mahal" (refleksi & transparansi)
const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0077be,
    transmission: 0.9, // Tembus pandang seperti kaca
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.1,
    reflectivity: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// --- SEA FLOOR (SAND) ---
const sandGeometry = new THREE.PlaneGeometry(300, 300, 64, 64);
// Buat undulasi (bukit pasir)
const pos = sandGeometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Simple wave noise for dunes
    pos.setZ(i, z + Math.sin(x / 10) * 2 + Math.cos(y / 15) * 2);
}
sandGeometry.computeVertexNormals();

const sandMaterial = new THREE.MeshStandardMaterial({
    map: createSandTexture(), // Panggil fungsi texture generator
    roughness: 1,
    color: 0xddccbb
});
const sand = new THREE.Mesh(sandGeometry, sandMaterial);
sand.rotation.x = -Math.PI / 2;
sand.position.y = -30; // Dasar laut
scene.add(sand);

// --- CORAL REEF (ORGANIC SHAPES) ---
// Menggunakan TorusKnot untuk bentuk karang yang rumit tanpa model luar
const corals = new THREE.Group();

const coralMaterial1 = new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.8 }); // Pink
const coralMaterial2 = new THREE.MeshStandardMaterial({ color: 0x4ecdc4, roughness: 0.8 }); // Teal
const coralMaterial3 = new THREE.MeshStandardMaterial({ color: 0xa8e6cf, roughness: 0.8 }); // Green

function createCoral(x, z, type) {
    let geo, mat;
    if (type === 1) {
        geo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Brain coral look
        mat = coralMaterial1;
    } else if (type === 2) {
        geo = new THREE.DodecahedronGeometry(1.5, 1); // Sponge look
        mat = coralMaterial2;
    } else {
        geo = new THREE.ConeGeometry(0.5, 3, 8); // Branching look
        mat = coralMaterial3;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, -28, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const scale = Math.random() + 0.5;
    mesh.scale.set(scale, scale, scale);
    corals.add(mesh);
}

// Generate Coral Cluster
for (let i = 0; i < 60; i++) {
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 60 - 10; // Spread out
    const type = Math.floor(Math.random() * 3) + 1;
    createCoral(x, z, type);
}
scene.add(corals);

// --- SEAWEED (SIMPLE INSTANCING) ---
// Rumput laut sederhana
const seaweedGeo = new THREE.CylinderGeometry(0.05, 0.1, 3, 4);
seaweedGeo.translate(0, 1.5, 0); // Pivot at bottom
const seaweedMat = new THREE.MeshLambertMaterial({ color: 0x2ab7ca });
const seaweedGroup = new THREE.Group();

for (let i = 0; i < 100; i++) {
    const clone = new THREE.Mesh(seaweedGeo, seaweedMat);
    clone.position.set((Math.random() - 0.5) * 80, -30, (Math.random() - 0.5) * 80);
    clone.rotation.z = (Math.random() - 0.5) * 0.5;
    // Simpan random offset untuk animasi
    clone.userData = { offset: Math.random() * 100, speed: Math.random() * 0.5 + 0.5 };
    seaweedGroup.add(clone);
}
scene.add(seaweedGroup);

// --- FISH (IMPROVED SHAPE) ---
const fishGroup = new THREE.Group();

function createRealisticFish() {
    // Group body parts
    const fish = new THREE.Group();

    // Body: Scaled Sphere
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeo.scale(1, 0.4, 0.2);
    const color = Math.random() > 0.5 ? 0xffd700 : 0xf25f5c; // Gold or Red
    const bodyMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.5 // Shiny scales
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);

    // Tail
    const tailGeo = new THREE.BufferGeometry();
    const tailVertices = new Float32Array([
        -0.5, 0, 0,   // center connect
        -1.0, 0.3, 0, // top tip
        -1.0, -0.3, 0 // bottom tip
    ]);
    tailGeo.setAttribute('position', new THREE.BufferAttribute(tailVertices, 3));
    const tailMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const tail = new THREE.Mesh(tailGeo, tailMat);

    fish.add(body);
    fish.add(tail);

    // Random pos
    fish.position.set(
        (Math.random() - 0.5) * 60,
        -10 - Math.random() * 15,
        (Math.random() - 0.5) * 40
    );

    fish.userData = {
        speed: 0.05 + Math.random() * 0.05,
        turnSpeed: Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2
    };

    return fish;
}

for (let i = 0; i < 50; i++) {
    fishGroup.add(createRealisticFish());
}
scene.add(fishGroup);


// --- SCROLL & ANIMATION ---

// Interaksi Mouse (Parallax Tipis)
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// Observer untuk teks
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.2 });
document.querySelectorAll('.content-box').forEach(el => observer.observe(el));

// Main Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPct = Math.min(scrollY / maxScroll, 1);

    // 1. KAMERA MOVEMENT
    // Y: Dari 3 (atas air) ke -25 (dasar laut)
    const targetY = 3 - (scrollPct * 28);
    // Z: Maju sedikit ke depan saat turun
    const targetZ = 15 - (scrollPct * 5);

    camera.position.y += (targetY - camera.position.y) * 0.05; // Smooth Lerp
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // Rotasi Kamera: Mendongak sedikit saat di dasar untuk melihat ikan di atas
    if (camera.position.y < -5) {
        camera.rotation.x = 0.1 + (mouseY * 0.05);
        // Change Fog to Underwater Blue
        scene.fog.color.lerp(fogColorWater, 0.05);
        scene.fog.density = 0.025; // Lebih tebal di air
        sunMesh.visible = false; // Matahari hilang di bawah air
    } else {
        camera.rotation.x = -0.05 + (mouseY * 0.05);
        // Change Fog to Sunset Orange
        scene.fog.color.lerp(fogColorAir, 0.05);
        scene.fog.density = 0.01;
        sunMesh.visible = true;
    }

    // 2. ANIMASI OMBAK (Vertices Manipulation)
    const waterPos = waterGeometry.attributes.position;
    for (let i = 0; i < waterPos.count; i++) {
        const x = waterPos.getX(i);
        const y = waterPos.getY(i); // actually Z in world
        // Gelombang kompleks (kombinasi sin/cos)
        const z = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.3 + time * 0.8) * 0.5;
        waterPos.setZ(i, z);
    }
    waterPos.needsUpdate = true;

    // 3. ANIMASI IKAN
    fishGroup.children.forEach(fish => {
        // Gerak maju sesuai rotasi
        fish.position.x += Math.cos(fish.userData.angle) * fish.userData.speed;
        fish.position.z += Math.sin(fish.userData.angle) * fish.userData.speed;

        // Rotasi badan ikan sesuai arah
        fish.rotation.y = -fish.userData.angle;

        // Ekor mengibas (Wiggle effect)
        // child[1] is tail
        fish.children[1].rotation.y = Math.sin(time * 15) * 0.3;

        // Turn around if too far
        const dist = Math.sqrt(fish.position.x ** 2 + fish.position.z ** 2);
        if (dist > 50) {
            fish.userData.angle += Math.PI; // Balik arah
        } else {
            // Random slight turn
            fish.userData.angle += (Math.random() - 0.5) * 0.05;
        }
    });

    // 4. ANIMASI RUMPUT LAUT
    seaweedGroup.children.forEach(weed => {
        // Bergoyang kena arus
        weed.rotation.z = Math.sin(time * 2 + weed.userData.offset) * 0.1;
        weed.rotation.x = Math.cos(time * 1.5 + weed.userData.offset) * 0.1;
    });

    // Parallax Camera Mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
