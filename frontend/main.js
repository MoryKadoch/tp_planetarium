import * as THREE from 'three';

// Tableau des textures disponibles
const textures = [
    'http://localhost:3000/public/img/public/img/8k_mercury.jpg',
    'http://localhost:3000/public/img/public/img/8k_venus_surface.jpg',
    'http://localhost:3000/public/img/public/img/8k_mars.jpg',
    'http://localhost:3000/public/img/public/img/8k_jupiter.jpg',
    'http://localhost:3000/public/img/public/img/8k_saturn.jpg',
    'http://localhost:3000/public/img/public/img/8k_sun.jpg',
];

// Scène et caméra
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);  // Position de la caméra pour voir le système solaire

// Variable pour stocker la planète sélectionnée
let selectedPlanet = null;

// Boîte d'information pour afficher les caractéristiques des planètes
const infoBox = document.getElementById('planetInfoBox');

// Fonction pour afficher les caractéristiques d'une planète dans la boîte d'information
function displayPlanetInfo(planet) {
    // Affiche les caractéristiques de la planète dans un élément HTML
    infoBox.innerHTML = `
        <h2>${planet.userData.name}</h2>
        <p><strong>Nombre de lunes :</strong> ${planet.userData.numMoons}</p>
        <p><strong>Minéraux :</strong> ${planet.userData.minerals}</p>
        <p><strong>Gravité :</strong> ${planet.userData.gravity}</p>
        <p><strong>Heures de lumière solaire :</strong> ${planet.userData.sunlightHours}</p>
        <p><strong>Température :</strong> ${planet.userData.temperature} °C</p>
        <p><strong>Temps de rotation :</strong> ${planet.userData.rotationTime} heures</p>
        <p><strong>Présence d'eau :</strong> ${planet.userData.waterPresence ? 'Oui' : 'Non'}</p>
        <p><strong>Colonisable :</strong> ${planet.userData.colonisable ? 'Oui' : 'Non'}</p>
    `;
    infoBox.style.display = 'block'; // Afficher la boîte d'information
}

// Cacher la boîte d'information si on clique à l'extérieur
window.addEventListener('click', (event) => {
    const infoBox = document.getElementById('planetInfoBox');
    
    if (infoBox.style.display === 'block') {
        // Si le clic est en dehors de la carte d'information, fermer la carte
        if (!infoBox.contains(event.target)) {
            infoBox.style.display = 'none';
        }
    }
});


// Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Étoile
const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load('http://localhost:3000/public/img/8k_stars.jpg');
scene.background = starTexture;  // Définir l'arrière-plan de la scène

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Augmente l'intensité
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);


// Créer un raycaster et un vecteur pour suivre la position de la souris
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variable pour stocker le sprite du nom actuel afin de pouvoir le cacher/montrer
let currentNameSprite = null;

// Fonction pour créer un anneau de néon vert autour de la planète
function createNeonRing(size) {
    const innerRadius = size + 0.2; // Ajuste la taille du rayon intérieur (inchangé)
    const outerRadius = size + 2.0; // Augmente la taille du rayon extérieur pour épaissir l'anneau
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Vert lumineux
        side: THREE.DoubleSide // Pour que l'anneau soit visible des deux côtés
    });
    const ring = new THREE.Mesh(geometry, material);

    // Ajuster l'orientation de l'anneau pour qu'il soit perpendiculaire à la caméra
    ring.rotation.x = Math.PI / 2;

    return ring;
}


// Fonction pour créer une planète
function createPlanet(size, positionX, texturePath, name, isColonisable) {
    const geometry = new THREE.SphereGeometry(size, 128, 128);
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        texturePath,
        (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = positionX;
            planet.userData = {
                name: name,
                colonisable: isColonisable,
                numMoons: planet.Num_Moons,  // Exemple
                minerals: planet.Minerals,   // Exemple
                gravity: planet.Gravity,     // Exemple
                sunlightHours: planet.Sunlight_Hours,  // Exemple
                temperature: planet.Temperature,  // Exemple
                rotationTime: planet.Rotation_Time,  // Exemple
                waterPresence: planet.Water_Presence,  // Exemple
            };
            
            scene.add(planet);

            // Si la planète est colonisable, ajoute un néon vert autour
            if (isColonisable) {
                const neonRing = createNeonRing(size);
                neonRing.position.set(positionX, 0, 0); // Positionner l'anneau au centre de la planète
                scene.add(neonRing);
            }
        },
        undefined,
        (error) => {
            console.error('Erreur lors du chargement de la texture:', error);
        }
    );
}

// Fonction pour supprimer la planète sélectionnée
function deleteSelectedPlanet() {
    if (selectedPlanet) {
        scene.remove(selectedPlanet); // Supprime la planète de la scène
        selectedPlanet = null; // Réinitialiser la sélection
        infoBox.style.display = 'none'; // Cacher la boîte d'information
    }
}
document.getElementById('deletePlanetButton').addEventListener('click', deleteSelectedPlanet);


function displayPlanets(planets) {
    // Supprimez les anciennes planètes de la scène
    scene.children = scene.children.filter(object => object.isLight || object === scene.background);

    const positions = [];
    planets.forEach((planetData, index) => {
        let size;
        let positionZ;

        if (index < 5) {
            size = 8; 
            positionZ = Math.random() * 2 - 2; 
        } else if (index >= 5 && index < 10) {
            size = 4; 
            positionZ = Math.random() * 5 - 10; 
        } else {
            size = 2; 
            positionZ = Math.random() * 15 - 25; 
        }

        let positionX;
        let validPositionFound = false;
        const minSpacing = size * 5;

        for (let attempts = 0; attempts < 100; attempts++) {
            positionX = Math.random() * 600 - 300; 

            if (positions.every(pos => Math.abs(pos - positionX) >= minSpacing)) {
                validPositionFound = true;
                break;
            }
        }

        if (!validPositionFound) {
            console.warn('Impossible de trouver une position valide, utilisez la position par défaut');
            positionX = 0;
        }

        positions.push(positionX);

        const texturePath = textures[Math.floor(Math.random() * textures.length)];

        // Ajoutez l'argument planetData ici pour transmettre les informations correctes
        createPlanet(size, positionX, texturePath, planetData.Name, planetData.Colonisable, planetData);

        const lastPlanet = scene.children[scene.children.length - 1];
        if (lastPlanet) {
            lastPlanet.position.z = positionZ;
        }
    });
}

// Fonction pour récupérer les planètes depuis le back-end
function fetchPlanets(page = currentPage) {
    fetch(`http://127.0.0.1:5000/api/planets?page=${page}&limit=20`)
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

// Gestionnaire d'événements pour le formulaire d'ajout de planète
document.getElementById('addPlanetForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupération des données du formulaire
    const formData = {
        Name: document.getElementById('name').value,
        Num_Moons: parseInt(document.getElementById('num_moons').value),
        Minerals: parseInt(document.getElementById('minerals').value),
        Gravity: parseFloat(document.getElementById('gravity').value),
        Sunlight_Hours: parseFloat(document.getElementById('sunlight_hours').value),
        Temperature: parseFloat(document.getElementById('temperature').value),
        Rotation_Time: parseFloat(document.getElementById('rotation_time').value),
        Water_Presence: document.getElementById('water_presence').value === 'true',
        Colonisable: document.getElementById('colonisable').value === 'true'
    };

    // Envoi des données au backend
    fetch('http://127.0.0.1:5000/api/planet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Planète ajoutée :', data);
        document.getElementById('addPlanetForm').reset(); // Réinitialiser le formulaire
        
        // Met à jour la liste des planètes
        fetchPlanets(currentPage); // Recharger les planètes sur la page actuelle
    })
    .catch(error => {
        console.error('Erreur lors de l\'ajout de la planète :', error);
    });
});

// Appeler la fonction pour afficher les planètes lorsque la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    fetchPlanets();
});

// Ajout des événements pour la pagination
let currentPage = 1;  // Commencer à la page 1

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

// Ajouter un événement de clic pour détecter quand une planète est sélectionnée
window.addEventListener('click', (event) => {
    // Met à jour le raycaster avec la position actuelle de la souris
    raycaster.setFromCamera(mouse, camera);

    // Vérifier les intersections avec les objets de la scène
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;

        // Vérifie si c'est bien une planète (en fonction de la présence des données utilisateur)
        if (clickedPlanet.userData && clickedPlanet.userData.name) {
            selectedPlanet = clickedPlanet; // Stocker la planète sélectionnée
            displayPlanetInfo(clickedPlanet); // Afficher ses caractéristiques
        }
    }
});


// Animation
function animate() {
    requestAnimationFrame(animate);

    // Mettre à jour le raycaster avec la position actuelle de la souris
    raycaster.setFromCamera(mouse, camera);

    // Vérifier les intersections avec les objets de la scène
    const planets = scene.children.filter(child => child instanceof THREE.Mesh);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedPlanet = intersects[0].object;

        // Change le curseur en pointer si une planète est survolée
        document.body.style.cursor = 'pointer';

        if (intersectedPlanet.userData && intersectedPlanet.userData.name) {
            if (currentNameSprite) {
                scene.remove(currentNameSprite); // Supprime l'ancien nom affiché
            }
        }
    } else {
        // Si aucune planète n'est survolée, rétablir le curseur par défaut
        document.body.style.cursor = 'auto';

    }

    // Faire tourner les planètes
    scene.children.forEach((planet) => {
        if (planet instanceof THREE.Mesh) {
            planet.rotation.y += 0.005;
        }
    });

    renderer.render(scene, camera);
}

// Gestion du mouvement de la souris pour mettre à jour les coordonnées
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

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