

// Onglets
const onglets = document.querySelectorAll('.onglet');
const sectionChronometre = document.querySelector('.section-chronometre');
const sectionMinuteur = document.querySelector('.section-minuteur');

// Chronomètre
const affichageChrono = document.getElementById('affichage-chrono');
const btnStartChrono = document.getElementById('start-chrono');
const btnStopChrono = document.getElementById('stop-chrono');
const btnResetChrono = document.getElementById('reset-chrono');
const listeTours = document.getElementById('liste-tours');

// Minuteur
const affichageMinuteur = document.getElementById('affichage-minuteur');
const btnStartMinuteur = document.getElementById('start-minuteur');
const btnStopMinuteur = document.getElementById('stop-minuteur');
const btnResetMinuteur = document.getElementById('reset-minuteur');
const inputHeures = document.getElementById('heures');
const inputMinutes = document.getElementById('minutes');
const inputSecondes = document.getElementById('secondes');
const barreProgression = document.getElementById('progression');
const sonFin = document.getElementById('son-fin');



// Chronomètre
let intervalChrono = null;          // Stocke l'ID de l'intervalle
let tempsChrono = 0;                // Temps en millisecondes
let compteurTours = 1;              // Numéro du tour actuel

// Minuteur
let intervalMinuteur = null;        // Stocke l'ID de l'intervalle
let tempsMinuteur = 0;              // Temps restant en secondes
let tempsMinuteurInitial = 0;       // Temps de départ pour la barre de progression



onglets.forEach(onglet => {
    onglet.addEventListener('click', () => {
       
        onglets.forEach(o => o.classList.remove('actif'));
        
        onglet.classList.add('actif');

        
        const mode = onglet.dataset.mode;

        
        if (mode === 'chronometre') {
            sectionChronometre.classList.add('active');
            sectionMinuteur.classList.remove('active');
        } else {
            sectionMinuteur.classList.add('active');
            sectionChronometre.classList.remove('active');
        }
    });
});



/**
 * Formate le temps en HH:MM:SS
 * @param {number} temps - Temps en millisecondes
 * @returns {string} - Temps formaté
 */
function formaterTemps(temps) {
    const heures = Math.floor(temps / 3600000);
    const minutes = Math.floor((temps % 3600000) / 60000);
    const secondes = Math.floor((temps % 60000) / 1000);

    // Ajoute un 0 devant si le nombre est < 10
    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`;
}

/**
 * Formate le temps du minuteur en HH:MM:SS
 * @param {number} temps - Temps en secondes
 * @returns {string} - Temps formaté
 */
function formaterTempsMinuteur(temps) {
    const heures = Math.floor(temps / 3600);
    const minutes = Math.floor((temps % 3600) / 60);
    const secondes = temps % 60;

    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`;
}




function startChronometre() {
    if (intervalChrono) return; // Si déjà démarré, ne rien faire

    const tempsDebut = Date.now() - tempsChrono;

    // Met à jour le temps toutes les 10ms pour plus de précision
    intervalChrono = setInterval(() => {
        tempsChrono = Date.now() - tempsDebut;
        affichageChrono.textContent = formaterTemps(tempsChrono);
    }, 10);

    // Gestion des boutons
    btnStartChrono.disabled = true;
    btnStopChrono.disabled = false;
}


function stopChronometre() {
    clearInterval(intervalChrono);
    intervalChrono = null;

    // Gestion des boutons
    btnStartChrono.disabled = false;
    btnStopChrono.disabled = true;
}


function resetChronometre() {
    clearInterval(intervalChrono);
    intervalChrono = null;
    tempsChrono = 0;
    compteurTours = 1;
    affichageChrono.textContent = '00:00:00';
    listeTours.innerHTML = '';

    // Gestion des boutons
    btnStartChrono.disabled = false;
    btnStopChrono.disabled = true;
}


function ajouterTour() {
    if (!intervalChrono) return; // Ne fonctionne que si le chrono tourne

    const tourDiv = document.createElement('div');
    tourDiv.classList.add('tour-item');
    tourDiv.innerHTML = `
        <span>Tour ${compteurTours}</span>
        <span class="temps-tour">${formaterTemps(tempsChrono)}</span>
    `;

    listeTours.insertBefore(tourDiv, listeTours.firstChild);
    compteurTours++;
}


function obtenirTempsMinuteur() {
    const h = parseInt(inputHeures.value) || 0;
    const m = parseInt(inputMinutes.value) || 0;
    const s = parseInt(inputSecondes.value) || 0;

    return h * 3600 + m * 60 + s; // Convertit tout en secondes
}

/**
 * Met à jour l'affichage du minuteur
 */
function mettreAJourAffichageMinuteur() {
    affichageMinuteur.textContent = formaterTempsMinuteur(tempsMinuteur);

    // Met à jour la barre de progression
    if (tempsMinuteurInitial > 0) {
        const pourcentage = (tempsMinuteur / tempsMinuteurInitial) * 100;
        barreProgression.style.width = pourcentage + '%';
    }
}

/**
 * Démarre le minuteur
 */
function startMinuteur() {
    if (intervalMinuteur) return; // Si déjà démarré, ne rien faire

    // Si c'est le premier démarrage, récupère le temps configuré
    if (tempsMinuteur === 0) {
        tempsMinuteur = obtenirTempsMinuteur();
        tempsMinuteurInitial = tempsMinuteur;

        if (tempsMinuteur === 0) {
            alert('⚠️ Veuillez configurer un temps supérieur à 0');
            return;
        }
    }

    // Compte à rebours toutes les secondes
    intervalMinuteur = setInterval(() => {
        tempsMinuteur--;
        mettreAJourAffichageMinuteur();

        // Quand le temps est écoulé
        if (tempsMinuteur <= 0) {
            clearInterval(intervalMinuteur);
            intervalMinuteur = null;

            // Animation et son
            affichageMinuteur.classList.add('termine');
            sonFin.play().catch(() => {
                // Si le son ne peut pas être joué (navigateur bloque)
                console.log('Son bloqué par le navigateur');
            });

            // Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⏲ Minuteur terminé !', {
                    body: 'Le temps est écoulé !',
                    icon: '⏲'
                });
            }

            // Retire l'animation après 2 secondes
            setTimeout(() => {
                affichageMinuteur.classList.remove('termine');
            }, 2000);

            // Réactive les boutons
            btnStartMinuteur.disabled = false;
            btnStopMinuteur.disabled = true;
        }
    }, 1000);

    // Gestion des boutons
    btnStartMinuteur.disabled = true;
    btnStopMinuteur.disabled = false;
    
    // Désactive les inputs pendant que le minuteur tourne
    inputHeures.disabled = true;
    inputMinutes.disabled = true;
    inputSecondes.disabled = true;
}

/**
 * Arrête le minuteur
 */
function stopMinuteur() {
    clearInterval(intervalMinuteur);
    intervalMinuteur = null;

    // Gestion des boutons
    btnStartMinuteur.disabled = false;
    btnStopMinuteur.disabled = true;
}

/**
 * Réinitialise le minuteur
 */
function resetMinuteur() {
    clearInterval(intervalMinuteur);
    intervalMinuteur = null;
    tempsMinuteur = 0;
    tempsMinuteurInitial = 0;
    
    // Réinitialise l'affichage
    const tempsConfig = obtenirTempsMinuteur();
    affichageMinuteur.textContent = formaterTempsMinuteur(tempsConfig);
    barreProgression.style.width = '100%';

    // Réactive les inputs
    inputHeures.disabled = false;
    inputMinutes.disabled = false;
    inputSecondes.disabled = false;

    // Gestion des boutons
    btnStartMinuteur.disabled = false;
    btnStopMinuteur.disabled = true;
}

/**
 * Met à jour l'affichage quand on change les valeurs
 */
function mettreAJourAffichageConfig() {
    if (!intervalMinuteur) { // Seulement si le minuteur n'est pas en cours
        const temps = obtenirTempsMinuteur();
        affichageMinuteur.textContent = formaterTempsMinuteur(temps);
    }
}



btnStartChrono.addEventListener('click', startChronometre);
btnStopChrono.addEventListener('click', stopChronometre);
btnResetChrono.addEventListener('click', resetChronometre);

// Double-clic sur l'affichage pour ajouter un tour
affichageChrono.addEventListener('dblclick', ajouterTour);



btnStartMinuteur.addEventListener('click', startMinuteur);
btnStopMinuteur.addEventListener('click', stopMinuteur);
btnResetMinuteur.addEventListener('click', resetMinuteur);

// Met à jour l'affichage quand on change les inputs
inputHeures.addEventListener('input', mettreAJourAffichageConfig);
inputMinutes.addEventListener('input', mettreAJourAffichageConfig);
inputSecondes.addEventListener('input', mettreAJourAffichageConfig);



document.addEventListener('keydown', (e) => {
    // Vérifie quelle section est active
    const chronoActif = sectionChronometre.classList.contains('active');

    if (e.code === 'Space') {
        e.preventDefault(); // Empêche le défilement de la page
        
        if (chronoActif) {
            // Chronomètre : Espace = Start/Stop
            if (intervalChrono) {
                stopChronometre();
            } else {
                startChronometre();
            }
        } else {
            // Minuteur : Espace = Start/Stop
            if (intervalMinuteur) {
                stopMinuteur();
            } else {
                startMinuteur();
            }
        }
    }

    if (e.code === 'KeyR') {
        // R = Reset
        if (chronoActif) {
            resetChronometre();
        } else {
            resetMinuteur();
        }
    }

    if (e.code === 'KeyL' && chronoActif) {
        // L = Lap (tour) - uniquement pour le chronomètre
        ajouterTour();
    }
});



if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}


// État initial des boutons
btnStopChrono.disabled = true;
btnStopMinuteur.disabled = true;

console.log('✅ Chronomètre/Minuteur initialisé !');
console.log('📌 Raccourcis clavier :');
console.log('   - Espace : Start/Stop');
console.log('   - R : Reset');
console.log('   - L : Ajouter un tour (chronomètre)');
console.log('   - Double-clic sur le temps : Ajouter un tour (chronomètre)');