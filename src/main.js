import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import config from '../amplify_outputs.json';

Amplify.configure(config);

// The rest of your Three.js code below

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

document.getElementById('startButton').addEventListener('click', async () => {
    if (THREE.AudioContext) {
      THREE.AudioContext.getContext().resume();
    }
  
    document.getElementById('startButton').style.display = 'none';
    
    await init(); // Start the fun!
  });
  
  async function init() {

// Audio setup is handled by the SOMA FM integration below

function loadSVGTexture(svgUrl, width = 1024, height = 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      resolve(texture);
    };
    img.onerror = () => console.error('Could not load SVG image');
    img.src = svgUrl;
  });
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .3;
document.body.appendChild(renderer.domElement);

// Bloom Composer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85);
composer.addPass(bloomPass);
//bloomPass.renderToScreen = true;

// Lighting - Hollywood glow style
const ambientLight = new THREE.AmbientLight(0x5c0b78, .5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xebf8f9, .1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

(async () => {
  const texture = await loadSVGTexture('./images/officeobject.svg');
  texture.encoding = THREE.sRGBEncoding;

// Load additional textures
const textureLoader = new THREE.TextureLoader();
const normalMap = textureLoader.load('./images/officeobject_normal.png');
const metalnessMap = textureLoader.load('./images/officeobject_metallic.png');
//const emissiveMap = textureLoader.load('./images/officeobject_emission.png');
/*
const emissiveFrames = [
    textureLoader.load('./images/officeobject_emission_1.png'),
    textureLoader.load('./images/officeobject_emission_2.png'),
    textureLoader.load('./images/officeobject_emission_3.png'),
    textureLoader.load('./images/officeobject_emission_4.png'),
  ];
  emissiveFrames.forEach(tex => tex.encoding = THREE.sRGBEncoding);
*/

const emissiveMap = textureLoader.load('./images/officeobject_emission_spritesheet.png');
  emissiveMap.encoding = THREE.sRGBEncoding;
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.RepeatWrapping;

  const tilesHoriz = 4;
  const tilesVert = 4;
  const numTiles = tilesHoriz * tilesVert;
  emissiveMap.repeat.set(1 / tilesHoriz, 1 / tilesVert);

  const exrLoader = new EXRLoader();
  exrLoader.load('./images/small_empty_room_3_1k.exr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envMap;

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  map: texture,
  normalMap: normalMap,
  metalnessMap: metalnessMap,
  //emissiveMap: emissiveMap,
  metalness: 1.0,  // Optional: use full metal if you want the metal map to control it
  roughness: 0.4,   // Adjust for smoother look
  emissive: new THREE.Color(0xffffff),
  emissiveMap: emissiveMap,
  emissiveIntensity: 1.5
});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Web Audio Setup
const listener = new THREE.AudioListener();
camera.add(listener);

// 🔊 Injected SOMA FM Audio Integration
// Create a container for audio controls
const audioControlsContainer = document.createElement('div');
audioControlsContainer.style.position = 'fixed';
audioControlsContainer.style.bottom = '20px';
audioControlsContainer.style.left = '20px';
audioControlsContainer.style.zIndex = '1000';
audioControlsContainer.style.display = 'flex';
audioControlsContainer.style.alignItems = 'center';
audioControlsContainer.style.gap = '10px';
document.body.appendChild(audioControlsContainer);

// Create play button
const playButton = document.createElement('button');
playButton.textContent = 'Play Music';
playButton.style.padding = '8px 16px';
playButton.style.backgroundColor = '#9e552f';
playButton.style.color = 'white';
playButton.style.border = 'none';
playButton.style.borderRadius = '4px';
playButton.style.cursor = 'pointer';
playButton.style.fontSize = '14px';
audioControlsContainer.appendChild(playButton);

const somaStations = [
  { name: 'Groove Salad (Chill)', stream: 'https://ice4.somafm.com/groovesalad-128-mp3', info: 'https://api.somafm.com/channels/groovesalad.json', mood: 'chill' },
  { name: 'Secret Agent (Jazz)', stream: 'https://ice6.somafm.com/secretagent-128-mp3', info: 'https://api.somafm.com/channels/secretagent.json', mood: 'jazz' },
  { name: 'Metal Detector (Metal)', stream: 'https://ice1.somafm.com/metal-128-mp3', info: 'https://api.somafm.com/channels/metal.json', mood: 'metal' },
  { name: 'Drone Zone', stream: 'https://ice1.somafm.com/dronezone-128-mp3', info: 'https://api.somafm.com/channels/dronezone.json', mood: 'drone' },
  { name: 'DEF CON Radio', stream: 'https://ice4.somafm.com/defcon-128-mp3', info: 'https://api.somafm.com/channels/defcon.json', mood: 'defcon' },
  { name: 'Beat Blender', stream: 'https://ice2.somafm.com/beatblender-128-mp3', info: 'https://api.somafm.com/channels/beatblender.json', mood: 'beat' },
  { name: 'Doomed (Dark)', stream: 'https://ice6.somafm.com/doomed-128-mp3', info: 'https://api.somafm.com/channels/doomed.json', mood: 'dark' },
  { name: 'Dub Step Beyond', stream: 'https://ice2.somafm.com/dubstep-128-mp3', info: 'https://api.somafm.com/channels/dubstep.json', mood: 'dubstep' },
  { name: 'Indie Pop Rocks', stream: 'https://ice1.somafm.com/indiepop-128-mp3', info: 'https://api.somafm.com/channels/indiepop.json', mood: 'indie' },
  { name: 'Mission Control', stream: 'https://ice6.somafm.com/missioncontrol-128-mp3', info: 'https://api.somafm.com/channels/missioncontrol.json', mood: 'space' }
];

// Dropdown to select station
const stationSelect = document.createElement('select');
stationSelect.style.padding = '6px';
stationSelect.style.borderRadius = '4px';
stationSelect.style.cursor = 'pointer';
stationSelect.style.fontSize = '12px';
stationSelect.style.backgroundColor = '#333';
stationSelect.style.color = '#fff';

somaStations.forEach((station, index) => {
  const option = document.createElement('option');
  option.value = index.toString();
  option.textContent = station.name;
  stationSelect.appendChild(option);
});
audioControlsContainer.appendChild(stationSelect);

// Create volume slider
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = '0';
volumeSlider.max = '1';
volumeSlider.step = '0.1';
volumeSlider.value = '0.5';
volumeSlider.style.width = '100px';
// volumeSlider.style.accentColor = '#007bff'; // Removed to rely on CSS for thumb
volumeSlider.style.cursor = 'pointer';
volumeSlider.style.pointerEvents = 'auto';
volumeSlider.id = 'volumeSlider'; // Add ID for CSS targeting
// Explicitly apply styles for track and appearance from index.html
volumeSlider.style.webkitAppearance = 'none';
volumeSlider.style.appearance = 'none';
volumeSlider.style.height = '8px';
volumeSlider.style.borderRadius = '4px';
volumeSlider.style.background = '#444'; // Track color
volumeSlider.style.outline = 'none';

// Create volume label
const volumeLabel = document.createElement('span');
volumeLabel.textContent = 'Volume: 50%';
volumeLabel.style.color = 'white';
volumeLabel.style.fontSize = '14px';
volumeLabel.style.marginRight = '5px';

// Add volume label and slider to container
//audioControlsContainer.appendChild(volumeLabel);
audioControlsContainer.appendChild(volumeSlider);

// Create HTML audio element for streaming
const audioElement = document.createElement('audio');
audioElement.style.display = 'none'; // Hide the audio element
document.body.appendChild(audioElement);

// URL of the stream
const streamUrl = 'https://ice4.somafm.com/groovesalad-128-mp3';
audioElement.src = streamUrl;
audioElement.crossOrigin = 'anonymous';
audioElement.preload = 'none'; // Don't preload until user clicks play

// Connect the HTML audio element to Three.js audio system
const sound = new THREE.Audio(listener);
sound.setMediaElementSource(audioElement);

// Track playing state
let isPlaying = false;

// Add loading indicator CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Play/pause button event listener
playButton.addEventListener('click', function() {
    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }
    
    if (!isPlaying) {
        // Show loading state
        playButton.textContent = 'Loading...';
        playButton.disabled = true;
        playButton.style.backgroundColor = '#6c757d';
        
        // Add loading indicator
        const loadingIndicator = document.createElement('span');
        loadingIndicator.textContent = ' ⟳';
        loadingIndicator.style.display = 'inline-block';
        loadingIndicator.style.animation = 'spin 1s linear infinite';
        playButton.appendChild(loadingIndicator);
        
        // Start loading the audio
        audioElement.load();
        
        // Play when ready
        audioElement.play().then(() => {
            isPlaying = true;
            playButton.textContent = 'Pause';
            playButton.disabled = false;
            playButton.style.backgroundColor = '#dc3545'; // Red for pause
        }).catch(error => {
            console.error('Error playing audio:', error);
            playButton.textContent = 'Play Music';
            playButton.disabled = false;
            playButton.style.backgroundColor = '#824323';
        });
    } else {
        audioElement.pause();
        isPlaying = false;
        playButton.textContent = 'Play Music';
        playButton.style.backgroundColor = '#9e552f'; // Blue for play
    }
});

let selectedStationIndex = 0;
audioElement.src = somaStations[selectedStationIndex].stream;

stationSelect.addEventListener('change', () => {
  selectedStationIndex = parseInt(stationSelect.value);
  const selected = somaStations[selectedStationIndex];

  audioElement.src = selected.stream;
  audioElement.load();
  if (isPlaying) {
    audioElement.play();
    playButton.textContent = 'Pause';
    playButton.style.backgroundColor = '#dc3545';
  }
  // 🔁 Change mood textures based on selected station - commented out as function is not defined
  // switchMoodTextures(selected.mood);
  //updateNowPlaying(); // Refresh song info
});

// Volume slider event listener - using 'input' for continuous update
volumeSlider.addEventListener('input', function() {
    if (listener.context.state === 'suspended') {
        listener.context.resume().then(() => {
            console.log('AudioContext resumed on volume input.');
        }).catch(e => console.error('Error resuming AudioContext on volume input:', e));
    }

    // On mobile, if audio is paused but playback is intended, try to play again.
    if (isTouchDevice && audioElement.paused && isPlaying) {
        audioElement.play().then(() => {
            console.log('Audio re-played on volume input (mobile).');
        }).catch(e => console.error('Error re-playing audio on volume input (mobile):', e));
    }

    const volume = parseFloat(volumeSlider.value);
    audioElement.volume = volume;
    volumeLabel.textContent = `Volume: ${Math.round(volume * 100)}%`;
    console.log('Volume set by input event to:', audioElement.volume);
});

// For touch devices, also try to resume context and play on touchstart of the slider
if (isTouchDevice) {
    volumeSlider.addEventListener('touchstart', function() {
        console.log('Volume slider touchstart (mobile)');
        if (listener.context.state === 'suspended') {
            listener.context.resume().then(() => {
                console.log('AudioContext resumed on volume touchstart (mobile).');
            }).catch(e => console.error('Error resuming context on volume touchstart (mobile):', e));
        }
        // If playback is intended but audio is paused, try to play.
        if (audioElement.paused && isPlaying) {
            audioElement.play().then(() => {
                console.log('Audio played on volume touchstart (mobile).');
            }).catch(e => console.error('Error playing audio on volume touchstart (mobile):', e));
        }
    }, { passive: true }); // Use passive listener as we are not calling preventDefault
}

// Prevent mousedown on slider from propagating to PointerLockControls
volumeSlider.addEventListener('mousedown', function(event) {
    event.stopPropagation();
});

// Handle audio loading events
audioElement.addEventListener('waiting', () => {
    playButton.textContent = 'Loading...';
    playButton.disabled = true;
    playButton.style.backgroundColor = '#6c757d';
    
    // Add loading indicator if not already present
    if (!playButton.querySelector('span')) {
        const loadingIndicator = document.createElement('span');
        loadingIndicator.textContent = ' ⟳';
        loadingIndicator.style.display = 'inline-block';
        loadingIndicator.style.animation = 'spin 1s linear infinite';
        playButton.appendChild(loadingIndicator);
    }
});

audioElement.addEventListener('playing', () => {
    playButton.textContent = 'Pause';
    playButton.disabled = false;
    playButton.style.backgroundColor = '#dc3545';
});

audioElement.addEventListener('error', (e) => {
    console.error('Audio error:', e);
});


// Using SOMA FM streaming audio instead of local audio file

// Create analyzer for visualizations
const analyser = new THREE.AudioAnalyser(sound, 128);

  // Event listeners for the play button - using the dynamically created playButton
  // (The original playPauseButton from DOM is no longer used)
  // playButton already has its own click event handler above

  // Volume slider event listener is already defined above

  let currentTile = 0;
  let lastFrameTime = 0;
  const frameDuration = 400;

  function updateSpriteFrame() {
    const col = currentTile % tilesHoriz;
    const row = Math.floor(currentTile / tilesHoriz);
    emissiveMap.offset.set(col / tilesHoriz, 1 - (row + 1) / tilesVert);
  }

  // Animate like it's auditioning for TRON
  function animate(time) {
    requestAnimationFrame(animate);

    const data = analyser.getFrequencyData();
  const avg = analyser.getAverageFrequency();

  // Emissive intensity from volume
  material.emissiveIntensity = 0.5 + (avg / 256) * 1.5;

  // Smooth hue cycling based on time and volume
  const hue = (time * 0.0001 + avg / 512) % 1;
  material.emissive.setHSL(hue, 1.0, 0.5);

    if (time - lastFrameTime > frameDuration) {
        lastFrameTime = time;
        currentTile = (currentTile + 1) % numTiles;
        updateSpriteFrame();
      }

    cube.rotation.x = time * 0.0005;
    cube.rotation.y = time * 0.0004;
    controls.update();
    renderer.render(scene, camera);
    composer.render();
  }

  updateSpriteFrame();
  animate();
});
})();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Define touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

} // Close the init() function
