const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const freqInfo = document.getElementById('freqInfo');
        
let audioContext;
let analyser;
let dataArray;
let animationId;
let source;
        
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
        
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
        
startBtn.addEventListener('click', async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
                
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
                
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        animate();
    } catch (err) {
        console.error('Erreur audio:', err);
    }
});
        
stopBtn.addEventListener('click', () => {
    if (source) {
        source.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    freqInfo.textContent = 'Fréquence dominante: 0 Hz';
});
        
function animate() {
    animationId = requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);
            
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawVisualizer();
    updateFrequencyInfo();
}
        
function drawVisualizer() {
    const barWidth = canvas.width / dataArray.length;
    let maxHeight = 0;
    let maxIndex = 0;
            
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] * (canvas.height / 256);
        if (barHeight > maxHeight) {
            maxHeight = barHeight;
            maxIndex = i;
        }
                
        const hue = i * 360 / dataArray.length;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        ctx.shadowBlur = 10;
                
        ctx.fillRect(
            i * barWidth,
            canvas.height - barHeight,
            barWidth * 0.7,
            barHeight
        );
    }
            
    // Effet de particules pour la barre dominante
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    for (let j = 0; j < 5; j++) {
        const x = maxIndex * barWidth + barWidth / 2;
        const y = canvas.height - maxHeight - 5;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
        
function updateFrequencyInfo() {
    let maxValue = 0;
    let maxIndex = 0;
            
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }
            
    const frequency = maxIndex * (audioContext.sampleRate / 2) / dataArray.length;
    freqInfo.textContent = `Fréquence dominante: ${Math.round(frequency)} Hz`;
}