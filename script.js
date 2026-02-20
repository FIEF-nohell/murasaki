import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// signature: nohell
const NOHELL_SIGNATURE = Object.freeze({
    alias: 'nohell',
    project: 'murasaki',
    fingerprint: 'hands > particles > vibration'
});

function installNohellSignature() {
    if (window.__NOHELL_SIGNATURE__) return;

    window.__NOHELL_SIGNATURE__ = NOHELL_SIGNATURE;
    window.nohell = () => {
        const pulses = [
            'signal pulse: 04',
            'hum layer: unstable',
            'particle noise: awake'
        ];
        const pulse = pulses[Math.floor(Math.random() * pulses.length)];

        console.groupCollapsed('%cnohell // signature', 'color:#e4e4e4;font-weight:700;letter-spacing:0.06em;');
        console.log('fingerprint:', NOHELL_SIGNATURE);
        console.log('gimmick:', pulse);
        console.log('hint: call nohell() again.');
        console.groupEnd();
        return pulse;
    };

    console.log('%cnohell // murasaki fingerprint', 'color:#ececec;font-weight:700;letter-spacing:0.08em;');
    console.log('%ctype nohell() for a hidden pulse.', 'color:#b0b0b0;');
}

installNohellSignature();

// --- Scene & Rendering ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 56;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.classList.add('webgl-bg');
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.6, 0.75, 0.16);
composer.addPass(bloomPass);

const RENDER_OVERSCAN_FACTOR = 1.16;
const SHAKE_MAX_PIXELS = 26;

function updateRenderSurface() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const renderWidth = Math.ceil(viewportWidth * RENDER_OVERSCAN_FACTOR);
    const renderHeight = Math.ceil(viewportHeight * RENDER_OVERSCAN_FACTOR);
    const offsetX = -Math.round((renderWidth - viewportWidth) / 2);
    const offsetY = -Math.round((renderHeight - viewportHeight) / 2);

    renderer.setSize(renderWidth, renderHeight, false);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset = 'auto';
    renderer.domElement.style.left = `${offsetX}px`;
    renderer.domElement.style.top = `${offsetY}px`;
    renderer.domElement.style.width = `${renderWidth}px`;
    renderer.domElement.style.height = `${renderHeight}px`;

    composer.setSize(renderWidth, renderHeight);
    bloomPass.setSize(renderWidth, renderHeight);
}

const COUNT = 20000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);

const targetPositions = new Float32Array(COUNT * 3);
const targetColors = new Float32Array(COUNT * 3);
const targetSizes = new Float32Array(COUNT);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

function createParticleSprite() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1.0, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const particleSprite = createParticleSprite();
const particleMaterial = new THREE.PointsMaterial({
    size: 0.55,
    sizeAttenuation: true,
    vertexColors: true,
    map: particleSprite,
    alphaMap: particleSprite,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const particles = new THREE.Points(geometry, particleMaterial);
scene.add(particles);

// Technique Functions
function getRed(i) {
    if (i < COUNT * 0.1) {
        const r = Math.random() * 9;
        const theta = Math.random() * 6.28; const phi = Math.acos(2 * Math.random() - 1);
        return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 2.2, g: 1.05, b: 0.25, s: 2.5 };
    } else {
        const armCount = 3; const t = (i / COUNT);
        const angle = t * 15 + ((i % armCount) * (Math.PI * 2 / armCount));
        const radius = 2 + (t * 40);
        return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: (Math.random() - 0.5) * (10 * t), r: 0.95, g: 0.42, b: 0.08, s: 1.0 };
    }
}

function getVoid(i) {
    if (i < COUNT * 0.15) {
        const angle = Math.random() * Math.PI * 2;
        return { x: 26 * Math.cos(angle), y: 26 * Math.sin(angle), z: (Math.random() - 0.5) * 1, r: 0.92, g: 1.0, b: 0.9, s: 2.5 };
    } else {
        const radius = 30 + Math.random() * 90;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return { x: radius * Math.sin(phi) * Math.cos(theta), y: radius * Math.sin(phi) * Math.sin(theta), z: radius * Math.cos(phi), r: 0.1, g: 0.9, b: 0.65, s: 0.7 };
    }
}

function getPurple(i) {
    if (Math.random() > 0.8) return { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, z: (Math.random() - 0.5) * 100, r: 0.72, g: 0.38, b: 0.82, s: 0.8 };
    const r = 20; const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), r: 1.0, g: 0.36, b: 0.78, s: 2.5 };
}

function getShrine(i) {
    const total = COUNT;
    if (i < total * 0.3) return { x: (Math.random() - 0.5) * 80, y: -15, z: (Math.random() - 0.5) * 80, r: 0.35, g: 0.22, b: 0.08, s: 0.8 };
    else if (i < total * 0.4) {
        const px = ((i % 4) < 2 ? 1 : -1) * 12; const pz = ((i % 4) % 2 == 0 ? 1 : -1) * 8;
        return { x: px + (Math.random() - 0.5) * 2, y: -15 + Math.random() * 30, z: pz + (Math.random() - 0.5) * 2, r: 0.34, g: 0.27, b: 0.18, s: 0.6 };
    } else if (i < total * 0.6) {
        const t = Math.random() * Math.PI * 2; const rad = Math.random() * 30;
        const curve = Math.pow(rad / 30, 2) * 10;
        return { x: rad * Math.cos(t), y: 15 - curve + (Math.random() * 2), z: rad * Math.sin(t) * 0.6, r: 0.88, g: 0.5, b: 0.18, s: 0.6 };
    } else return { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
}

function getFlip(i) {
    if (i < COUNT * 0.22) {
        const radius = Math.random() * 3.1;
        const theta = Math.random() * Math.PI * 2;
        const y = -18 + Math.pow(Math.random(), 0.35) * 60;
        return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, r: 1.2, g: 1.5, b: 0.45, s: 1.95 };
    } else if (i < COUNT * 0.42) {
        return { x: (Math.random() - 0.5) * 22, y: -20 + Math.random() * 8, z: (Math.random() - 0.5) * 12, r: 0.75, g: 0.9, b: 0.3, s: 1.0 };
    } else {
        const angle = Math.random() * Math.PI * 2;
        const spread = 14 + Math.random() * 62;
        return { x: Math.cos(angle) * spread, y: Math.random() * 36 - 8, z: Math.sin(angle) * spread * 0.9, r: 0.42, g: 0.56, b: 0.18, s: 0.52 };
    }
}

const AUDIO_PROFILES = {
    neutral: { master: 0.045, subFreq: 34, bodyFreq: 61, lowpass: 150, bandpass: 76, noise: 0.006, tremoloHz: 2.8, tremoloDepth: 0.022, drive: 1.1, detune: 2.5, shimmerHz: 0.08, lfoDepth: 32 },
    red: { master: 0.065, subFreq: 42, bodyFreq: 78, lowpass: 260, bandpass: 104, noise: 0.012, tremoloHz: 4.7, tremoloDepth: 0.034, drive: 1.35, detune: 5.5, shimmerHz: 0.18, lfoDepth: 48 },
    void: { master: 0.06, subFreq: 30, bodyFreq: 49, lowpass: 180, bandpass: 68, noise: 0.02, tremoloHz: 1.9, tremoloDepth: 0.026, drive: 1.2, detune: 8.5, shimmerHz: 0.05, lfoDepth: 44 },
    purple: { master: 0.078, subFreq: 47, bodyFreq: 96, lowpass: 370, bandpass: 140, noise: 0.014, tremoloHz: 6.8, tremoloDepth: 0.042, drive: 1.55, detune: 12, shimmerHz: 0.24, lfoDepth: 55 },
    shrine: { master: 0.075, subFreq: 39, bodyFreq: 70, lowpass: 290, bandpass: 124, noise: 0.01, tremoloHz: 3.4, tremoloDepth: 0.03, drive: 1.45, detune: 4.5, shimmerHz: 0.11, lfoDepth: 50 },
    flip: { master: 0.09, subFreq: 36, bodyFreq: 88, lowpass: 340, bandpass: 150, noise: 0.018, tremoloHz: 8.2, tremoloDepth: 0.05, drive: 1.65, detune: 14, shimmerHz: 0.31, lfoDepth: 58 }
};

function createDriveCurve(amount = 35) {
    const sampleCount = 44100;
    const curve = new Float32Array(sampleCount);
    const k = Math.max(1, amount);
    for (let i = 0; i < sampleCount; i++) {
        const x = (i * 2) / sampleCount - 1;
        curve[i] = ((3 + k) * x * 20 * Math.PI) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function createNoiseBuffer(context, durationSeconds = 2) {
    const length = Math.floor(context.sampleRate * durationSeconds);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = white * (0.65 + Math.random() * 0.35);
    }
    return buffer;
}

class ProceduralAudioEngine {
    constructor(statusElement) {
        this.statusElement = statusElement;
        this.baseStatusText = statusElement ? statusElement.innerText : '';
        this.context = null;
        this.masterGain = null;
        this.coreGain = null;
        this.subGain = null;
        this.bodyGain = null;
        this.noiseGain = null;
        this.bodyOscA = null;
        this.bodyOscB = null;
        this.subOsc = null;
        this.noiseSource = null;
        this.lowpassFilter = null;
        this.bandpassFilter = null;
        this.driveGain = null;
        this.shaper = null;
        this.compressor = null;
        this.tremoloOsc = null;
        this.tremoloDepth = null;
        this.shimmerOsc = null;
        this.shimmerDepth = null;
        this.modulationTimer = null;
        this.currentTechnique = 'neutral';
        this.ready = false;
        this.isEnabled = false;
        this.setStatusText(false);
    }

    setStatusText(enabled) {
        if (!this.statusElement) return;
        if (!enabled) {
            this.statusElement.innerText = `${this.baseStatusText} Tap or press any key once for deep procedural audio.`;
        } else {
            this.statusElement.innerText = `${this.baseStatusText} Procedural drone audio active.`;
        }
    }

    ensureGraph() {
        if (this.ready) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        this.context = new AudioContextClass();
        const ctx = this.context;

        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.001;

        this.coreGain = ctx.createGain();
        this.coreGain.gain.value = 0.5;

        this.subGain = ctx.createGain();
        this.subGain.gain.value = 0.34;

        this.bodyGain = ctx.createGain();
        this.bodyGain.gain.value = 0.19;

        this.noiseGain = ctx.createGain();
        this.noiseGain.gain.value = 0.006;

        this.driveGain = ctx.createGain();
        this.driveGain.gain.value = 1.1;

        this.shaper = ctx.createWaveShaper();
        this.shaper.curve = createDriveCurve(40);
        this.shaper.oversample = '4x';

        this.lowpassFilter = ctx.createBiquadFilter();
        this.lowpassFilter.type = 'lowpass';
        this.lowpassFilter.frequency.value = 160;
        this.lowpassFilter.Q.value = 0.82;

        this.bandpassFilter = ctx.createBiquadFilter();
        this.bandpassFilter.type = 'bandpass';
        this.bandpassFilter.frequency.value = 75;
        this.bandpassFilter.Q.value = 0.55;

        this.compressor = ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 28;
        this.compressor.ratio.value = 8;
        this.compressor.attack.value = 0.01;
        this.compressor.release.value = 0.22;

        this.subOsc = ctx.createOscillator();
        this.subOsc.type = 'sine';
        this.subOsc.frequency.value = 34;

        this.bodyOscA = ctx.createOscillator();
        this.bodyOscA.type = 'triangle';
        this.bodyOscA.frequency.value = 60;

        this.bodyOscB = ctx.createOscillator();
        this.bodyOscB.type = 'sawtooth';
        this.bodyOscB.frequency.value = 61;
        this.bodyOscB.detune.value = 2.5;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 120;
        noiseFilter.Q.value = 0.8;
        const noiseBuffer = createNoiseBuffer(ctx);
        this.noiseSource = ctx.createBufferSource();
        this.noiseSource.buffer = noiseBuffer;
        this.noiseSource.loop = true;

        this.tremoloOsc = ctx.createOscillator();
        this.tremoloOsc.type = 'sine';
        this.tremoloOsc.frequency.value = 2.8;
        this.tremoloDepth = ctx.createGain();
        this.tremoloDepth.gain.value = 0.022;

        this.shimmerOsc = ctx.createOscillator();
        this.shimmerOsc.type = 'sine';
        this.shimmerOsc.frequency.value = 0.08;
        this.shimmerDepth = ctx.createGain();
        this.shimmerDepth.gain.value = 32;

        this.subOsc.connect(this.subGain);
        this.bodyOscA.connect(this.bodyGain);
        this.bodyOscB.connect(this.bodyGain);
        this.noiseSource.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);

        this.subGain.connect(this.coreGain);
        this.bodyGain.connect(this.coreGain);
        this.noiseGain.connect(this.coreGain);

        this.coreGain.connect(this.driveGain);
        this.driveGain.connect(this.shaper);
        this.shaper.connect(this.lowpassFilter);
        this.lowpassFilter.connect(this.bandpassFilter);
        this.bandpassFilter.connect(this.compressor);
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(ctx.destination);

        this.tremoloOsc.connect(this.tremoloDepth);
        this.tremoloDepth.connect(this.coreGain.gain);
        this.shimmerOsc.connect(this.shimmerDepth);
        this.shimmerDepth.connect(this.lowpassFilter.frequency);

        const now = ctx.currentTime;
        this.subOsc.start(now);
        this.bodyOscA.start(now);
        this.bodyOscB.start(now);
        this.noiseSource.start(now);
        this.tremoloOsc.start(now);
        this.shimmerOsc.start(now);

        this.modulationTimer = window.setInterval(() => {
            if (!this.ready || !this.isEnabled) return;
            const profile = AUDIO_PROFILES[this.currentTechnique] || AUDIO_PROFILES.neutral;
            const time = this.context.currentTime;
            const detuneJitter = (Math.random() - 0.5) * 7;
            const bandJitter = profile.bandpass * (0.88 + Math.random() * 0.24);
            this.bodyOscB.detune.setTargetAtTime(profile.detune + detuneJitter, time, 0.7);
            this.bandpassFilter.frequency.setTargetAtTime(Math.max(46, bandJitter), time, 0.85);
        }, 900);

        this.ready = true;
        this.setTechnique(this.currentTechnique, true);
    }

    async unlock() {
        this.ensureGraph();
        if (!this.context) return false;
        if (this.context.state !== 'running') {
            await this.context.resume();
        }
        this.isEnabled = true;
        this.setStatusText(true);
        this.setTechnique(this.currentTechnique, true);
        return true;
    }

    setTechnique(technique, immediate = false) {
        this.currentTechnique = technique;
        if (!this.ready || !this.context) return;

        const profile = AUDIO_PROFILES[technique] || AUDIO_PROFILES.neutral;
        const now = this.context.currentTime;
        const ramp = immediate ? 0.06 : 0.45;

        this.masterGain.gain.cancelScheduledValues(now);
        this.subOsc.frequency.cancelScheduledValues(now);
        this.bodyOscA.frequency.cancelScheduledValues(now);
        this.bodyOscB.frequency.cancelScheduledValues(now);
        this.bodyOscB.detune.cancelScheduledValues(now);
        this.lowpassFilter.frequency.cancelScheduledValues(now);
        this.bandpassFilter.frequency.cancelScheduledValues(now);
        this.noiseGain.gain.cancelScheduledValues(now);
        this.tremoloOsc.frequency.cancelScheduledValues(now);
        this.tremoloDepth.gain.cancelScheduledValues(now);
        this.shimmerOsc.frequency.cancelScheduledValues(now);
        this.shimmerDepth.gain.cancelScheduledValues(now);
        this.driveGain.gain.cancelScheduledValues(now);

        this.masterGain.gain.linearRampToValueAtTime(profile.master, now + ramp);
        this.subOsc.frequency.linearRampToValueAtTime(profile.subFreq, now + ramp);
        this.bodyOscA.frequency.linearRampToValueAtTime(profile.bodyFreq, now + ramp);
        this.bodyOscB.frequency.linearRampToValueAtTime(profile.bodyFreq * 1.02, now + ramp);
        this.bodyOscB.detune.linearRampToValueAtTime(profile.detune, now + ramp);
        this.lowpassFilter.frequency.linearRampToValueAtTime(profile.lowpass, now + ramp);
        this.bandpassFilter.frequency.linearRampToValueAtTime(profile.bandpass, now + ramp);
        this.noiseGain.gain.linearRampToValueAtTime(profile.noise, now + ramp);
        this.tremoloOsc.frequency.linearRampToValueAtTime(profile.tremoloHz, now + ramp);
        this.tremoloDepth.gain.linearRampToValueAtTime(profile.tremoloDepth, now + ramp);
        this.shimmerOsc.frequency.linearRampToValueAtTime(profile.shimmerHz, now + ramp);
        this.shimmerDepth.gain.linearRampToValueAtTime(profile.lfoDepth, now + ramp);
        this.driveGain.gain.linearRampToValueAtTime(profile.drive, now + ramp);
    }
}

// Hand Tracking
let currentTech = 'neutral';
let shakeIntensity = 0;
const videoElement = document.querySelector('.input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
let glowColor = '#8de7cf';
const uiHintElement = document.getElementById('ui-hint');
const audioEngine = new ProceduralAudioEngine(uiHintElement);

async function unlockAudio() {
    try {
        const unlocked = await audioEngine.unlock();
        if (!unlocked) return;
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    } catch (error) {
        console.warn('Unable to unlock procedural audio:', error);
    }
}

window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio);

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7 });

hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    let detected = 'neutral';

    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((lm) => {
            drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, { color: glowColor, lineWidth: 5 });
            drawLandmarks(canvasCtx, lm, { color: '#e8fff5', lineWidth: 1, radius: 2 });

            const isUp = (t, p) => lm[t].y < lm[p].y;
            const pinch = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);
            const indexUp = isUp(8, 6);
            const middleUp = isUp(12, 10);
            const ringUp = isUp(16, 14);
            const pinkyUp = isUp(20, 18);
            const middleFingerGesture = middleUp && !indexUp && !ringUp && !pinkyUp;

            if (pinch < 0.04) detected = 'purple';
            else if (middleFingerGesture) detected = 'flip';
            else if (indexUp && middleUp && ringUp && pinkyUp) detected = 'shrine';
            else if (indexUp && middleUp && !ringUp) detected = 'void';
            else if (indexUp && !middleUp) detected = 'red';
        });
    }
    updateState(detected);
});

function updateState(tech) {
    if (currentTech === tech) return;
    currentTech = tech;
    const nameEl = document.getElementById('technique-name');
    shakeIntensity = tech !== 'neutral' ? 0.28 : 0;

    if (tech === 'shrine') { glowColor = '#ff9a3d'; nameEl.innerText = "Domain Expansion - Malevolent Shrine"; bloomPass.strength = 2.2; }
    else if (tech === 'purple') { glowColor = '#ff4fcf'; nameEl.innerText = "Secret Technique - Hollow Purple"; bloomPass.strength = 2.8; }
    else if (tech === 'flip') { glowColor = '#d3ff70'; nameEl.innerText = "Fuck You"; bloomPass.strength = 2.4; }
    else if (tech === 'void') { glowColor = '#72ffd7'; nameEl.innerText = "Domain Expansion - Infinite Void"; bloomPass.strength = 1.9; }
    else if (tech === 'red') { glowColor = '#ffb347'; nameEl.innerText = "Reverse Cursed Technique - Red"; bloomPass.strength = 2.1; }
    else { glowColor = '#8de7cf'; nameEl.innerText = "Awaiting Hand Gesture"; bloomPass.strength = 1.4; }
    audioEngine.setTechnique(tech);

    for (let i = 0; i < COUNT; i++) {
        let p;
        if (tech === 'neutral') {
            if (i < COUNT * 0.05) {
                const r = 15 + Math.random() * 20; const t = Math.random() * 6.28; const ph = Math.random() * 3.14;
                p = { x: r * Math.sin(ph) * Math.cos(t), y: r * Math.sin(ph) * Math.sin(t), z: r * Math.cos(ph), r: 0.08, g: 0.16, b: 0.14, s: 0.4 };
            } else p = { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, s: 0 };
        }
        else if (tech === 'red') p = getRed(i);
        else if (tech === 'void') p = getVoid(i);
        else if (tech === 'purple') p = getPurple(i);
        else if (tech === 'shrine') p = getShrine(i);
        else if (tech === 'flip') p = getFlip(i);

        targetPositions[i * 3] = p.x; targetPositions[i * 3 + 1] = p.y; targetPositions[i * 3 + 2] = p.z;
        targetColors[i * 3] = p.r; targetColors[i * 3 + 1] = p.g; targetColors[i * 3 + 2] = p.b;
        targetSizes[i] = p.s;
    }
}

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        await hands.send({ image: videoElement });
    }, width: 640, height: 480
});
cameraUtils.start();

// Animation
function animate() {
    requestAnimationFrame(animate);

    if (shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity * SHAKE_MAX_PIXELS;
        const shakeY = (Math.random() - 0.5) * shakeIntensity * SHAKE_MAX_PIXELS;
        renderer.domElement.style.transform = `translate3d(${shakeX}px, ${shakeY}px, 0)`;
    } else {
        renderer.domElement.style.transform = 'translate3d(0,0,0)';
    }

    const pos = particles.geometry.attributes.position.array;
    const col = particles.geometry.attributes.color.array;
    const siz = particles.geometry.attributes.size.array;

    for (let i = 0; i < COUNT * 3; i++) {
        pos[i] += (targetPositions[i] - pos[i]) * 0.1;
        col[i] += (targetColors[i] - col[i]) * 0.1;
    }
    for (let i = 0; i < COUNT; i++) siz[i] += (targetSizes[i] - siz[i]) * 0.1;

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;

    // UPDATED ROTATION LOGIC: Locking rotation for Shrine
    if (currentTech === 'red') {
        particles.rotation.z -= 0.1;
    } else if (currentTech === 'flip') {
        particles.rotation.y += 0.08;
        particles.rotation.x += 0.012;
    } else if (currentTech === 'purple') {
        particles.rotation.z += 0.2;
        particles.rotation.y += 0.05;
    } else if (currentTech === 'shrine') {
        // FORCE UPRIGHT: Reset and freeze all rotations
        particles.rotation.set(0, 0, 0);
    } else {
        // Default Neutral rotation
        particles.rotation.y += 0.005;
    }

    composer.render();
}
animate();

function handleResize() {
    const isCompact = window.innerWidth < 960;
    camera.fov = isCompact ? 80 : 72;
    camera.position.z = isCompact ? 62 : 56;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateRenderSurface();
}

handleResize();
window.addEventListener('resize', handleResize);
