import * as THREE from 'three';

// Tableau des textures disponibles
const textures = [
    '../public/img/8k_mercury.jpg',
    '../public/img/8k_venus_surface.jpg',
    '../public/img/8k_mars.jpg',
    '../public/img/8k_jupiter.jpg',
    '../public/img/8k_saturn.jpg',
    '../public/img/8k_sun.jpg',
];

// Scène et caméra
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);  // Position de la caméra pour voir le système solaire

// Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Étoile
const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load('../public/img/8k_stars.jpg');
scene.background = starTexture;  // Définir l'arrière-plan de la scène

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Augmente l'intensité
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Fonction pour créer une planète
function createPlanet(size, positionX, texturePath) {
    const geometry = new THREE.SphereGeometry(size, 128, 128);
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        texturePath,
        (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = positionX;
            scene.add(planet);
        },
        undefined,
        (error) => {
            console.error('Erreur lors du chargement de la texture:', error);
        }
    );
}

let currentPage = 1;  // Commencer à la page 1

// Fonction pour récupérer les planètes depuis le back-end
function fetchPlanets(page = currentPage) {
    fetch(`http://192.168.56.1:5000/api/planets?page=${page}&limit=20`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayPlanets(data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
        });
}

// Appelle la fonction après le chargement de la page
document.addEventListener('DOMContentLoaded', () => fetchPlanets());

// Fonction pour afficher les planètes dans la scène
function displayPlanets(planets) {
    // Supprime les anciennes planètes avant d'en ajouter les nouvelles
    while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
    }

    planets.forEach(planet => {
        const size = 1;  // Ajuste la taille selon ton besoin
        const positionX = Math.random() * 200;  // Position X aléatoire pour espacer les planètes
        
        // Choisir une texture aléatoire
        const texturePath = textures[Math.floor(Math.random() * textures.length)];
        
        createPlanet(size, positionX, texturePath);  // Crée la planète avec la texture
    });
}

// Ajout des événements pour la pagination
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPlanets(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    fetchPlanets(currentPage);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    // Rotation des planètes
    scene.children.forEach((planet) => {
        if (planet instanceof THREE.Mesh) {
            planet.rotation.y += 0.01;  // Rotation de chaque planète
        }
    });
    renderer.render(scene, camera);
}

// Démarrer l'animation
animate();

// Gestion de l'affichage du formulaire
const toggleFormButton = document.getElementById('toggleFormButton');
const formContainer = document.getElementById('formContainer');
const overlay = document.getElementById('overlay');

toggleFormButton.addEventListener('click', () => {
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
        overlay.style.display = 'block';  // Affiche l'overlay
    } else {
        formContainer.style.display = 'none';
        overlay.style.display = 'none';  // Cache l'overlay
    }
});

// Fermer le formulaire en cliquant sur l'overlay
overlay.addEventListener('click', () => {
    formContainer.style.display = 'none';
    overlay.style.display = 'none';  // Cache l'overlay
});

// Événements pour le zoom et le drag
window.addEventListener('wheel', (event) => {
    const zoomAmount = event.deltaY * 0.01;
    camera.position.z += zoomAmount;
});

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', (event) => {
    isDragging = true;
    document.body.style.cursor = 'pointer'; // Change le curseur en pointer
});
window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        camera.position.x -= deltaMove.x * 0.1;
        camera.position.y += deltaMove.y * 0.1;
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
});
window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'auto'; // Remet le curseur par défaut
});

// Ajuster la fenêtre en cas de redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
