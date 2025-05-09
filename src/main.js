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
    const audioControls = document.getElementById('audioControls');
    audioControls.style.display = 'block'; // Show audio controls
    
    // Ensure slider is updated after controls are visible and audio is likely to be set up
    // We'll also set it again in the audio.load callback for robustness
    const volumeSliderElement = document.getElementById('volumeSlider');
    if (volumeSliderElement) {
        // The audio object might not be fully ready here, but we can set the default HTML value
        // The more reliable update will be in the audio.load callback
    }

    await init(); // Start the fun!
  });
  
  async function init() {

// Audio Controls - moved element retrieval inside init to ensure they are accessed after DOM is ready
const playPauseButton = document.getElementById('playPauseButton');
const volumeSlider = document.getElementById('volumeSlider');

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

const audio = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load('./audio/neonawakening.mp3', function(buffer) {
  audio.setBuffer(buffer);
  audio.setLoop(true);
  audio.setVolume(0.5); // Set initial volume to 0.5
  audio.play();

  // Update UI elements after audio is loaded and properties are set
  if (playPauseButton) { 
    playPauseButton.textContent = 'Pause'; // Audio starts playing
  }
  if (volumeSlider) { 
    volumeSlider.value = 0.5; // Explicitly set slider to 0.5
  }
});

const analyser = new THREE.AudioAnalyser(audio, 128);

  // Event listeners are attached to elements retrieved at the start of init
  playPauseButton.addEventListener('click', () => {
    if (audio.isPlaying) {
      audio.pause();
      playPauseButton.textContent = 'Play';
    } else {
      audio.play();
      playPauseButton.textContent = 'Pause';
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.setVolume(parseFloat(volumeSlider.value));
  });

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
  }
