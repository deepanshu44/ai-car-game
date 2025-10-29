// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position the camera
camera.position.z = 20;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Create a group for the house
const house = new THREE.Group();
scene.add(house);

// Create the base (a cube)
const baseGeometry = new THREE.BoxGeometry(10, 5, 10);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = 2.5;
house.add(base);

// Create the roof (a pyramid)
const roofGeometry = new THREE.ConeGeometry(8, 5, 4);
roofGeometry.rotateX(Math.PI / 2);
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // Dark red
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 7.5;
house.add(roof);

// Create a door
const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 1, -5);
house.add(door);

// Create windows
const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6 }); // Light blue
const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
window1.position.set(3, 3, -5);
house.add(window1);

const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
window2.position.set(-3, 3, -5);
house.add(window2);

// Chimney
const chimneyGeometry = new THREE.BoxGeometry(1, 3, 1);
const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
chimney.position.set(3, 8, 2);
house.add(chimney);

// Smoke (using particles)
const smokeParticles = new THREE.Group();
for (let i = 0; i < 10; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.set(
        3 + Math.random() * 0.2,
        9 + Math.random() * 0.5,
        2 + Math.random() * 0.2
    );
    smokeParticles.add(particle);
}
house.add(smokeParticles);

// Grass (plane)
const grassGeometry = new THREE.PlaneGeometry(30, 30);
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.1;
scene.add(grass);

// Flowers (simple spheres)
for (let i = 0; i < 20; i++) {
    const flowerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const flowerMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.set(
        -10 + Math.random() * 20,
        0.2,
        -10 + Math.random() * 20
    );
    scene.add(flower);
}

// Fence
for (let i = 0; i < 15; i++) {
    const fenceGeometry = new THREE.BoxGeometry(0.2, 1, 0.1);
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence.position.set(-10 + i * 1.5, 0.5, -8);
    scene.add(fence);
}

// Skybox (simple blue background)
scene.background = new THREE.Color(0x87CEEB);

smokeParticles.children.forEach(particle => {
    particle.position.y += 0.01;
    if (particle.position.y > 10) {
        particle.position.y = 9;
    }
});

renderer.shadowMap.enabled = true;
base.castShadow = true;
roof.castShadow = true;
directionalLight.castShadow = true;

function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    renderer.render(scene, camera);
}
animate();
