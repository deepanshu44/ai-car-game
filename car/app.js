// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Position the camera
camera.position.set(5, 3, 10);
camera.lookAt(0, 1, 0);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add neon lights (point lights for glow effect)
const neonLight1 = new THREE.PointLight(0x0066ff, 1, 10);
neonLight1.position.set(1, 1, 2);
scene.add(neonLight1);

const neonLight2 = new THREE.PointLight(0x9900ff, 1, 10);
neonLight2.position.set(-1, 1, 2);
scene.add(neonLight2);

// Create a group for the car
const car = new THREE.Group();
scene.add(car);

// Car body (main chassis)
const bodyGeometry = new THREE.BoxGeometry(4, 0.8, 2);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x111133,
    emissiveIntensity: 0.2
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1;
body.castShadow = true;
car.add(body);

// Front "hood" (sharp angle)
const frontGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
const frontMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x330066,
    emissiveIntensity: 0.3
});
const front = new THREE.Mesh(frontGeometry, frontMaterial);
front.position.set(1.25, 1, 0);
car.add(front);

// Neon accents (glowing lines)
const accentGeometry = new THREE.BoxGeometry(0.1, 0.1, 2.2);
const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x0066ff,
    emissive: 0x0066ff,
    emissiveIntensity: 1
});
const accentLeft = new THREE.Mesh(accentGeometry, accentMaterial);
accentLeft.position.set(-1.9, 0.9, 0);
car.add(accentLeft);

const accentRight = new THREE.Mesh(accentGeometry, accentMaterial);
accentRight.position.set(-1.9, 0.9, 0);
car.add(accentRight);

// Transparent glass cockpit
const cockpitGeometry = new THREE.BoxGeometry(1, 0.6, 1.5);
const cockpitMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.5,
    metalness: 0.1,
    roughness: 0.1
});
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
cockpit.position.set(0.5, 1.3, 0);
car.add(cockpit);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.2
});
const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelFL.position.set(-1, 0.5, 1);
wheelFL.rotation.z = Math.PI / 2;
car.add(wheelFL);

const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelFR.position.set(-1, 0.5, -1);
wheelFR.rotation.z = Math.PI / 2;
car.add(wheelFR);

const wheelBL = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelBL.position.set(1, 0.5, 1);
wheelBL.rotation.z = Math.PI / 2;
car.add(wheelBL);

const wheelBR = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelBR.position.set(1, 0.5, -1);
wheelBR.rotation.z = Math.PI / 2;
car.add(wheelBR);

// Glowing rims
const rimGeometry = new THREE.TorusGeometry(0.45, 0.05, 16, 32);
const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x9900ff,
    emissive: 0x9900ff,
    emissiveIntensity: 1
});
const rimFL = new THREE.Mesh(rimGeometry, rimMaterial);
rimFL.position.set(-1, 0.5, 1);
rimFL.rotation.x = Math.PI / 2;
car.add(rimFL);

const rimFR = new THREE.Mesh(rimGeometry, rimMaterial);
rimFR.position.set(-1, 0.5, -1);
rimFR.rotation.x = Math.PI / 2;
car.add(rimFR);

const rimBL = new THREE.Mesh(rimGeometry, rimMaterial);
rimBL.position.set(1, 0.5, 1);
rimBL.rotation.x = Math.PI / 2;
car.add(rimBL);

const rimBR = new THREE.Mesh(rimGeometry, rimMaterial);
rimBR.position.set(1, 0.5, -1);
rimBR.rotation.x = Math.PI / 2;
car.add(rimBR);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
