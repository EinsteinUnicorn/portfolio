'use strict';

// These examples demonstrate the project's interaction; no inference or recording occurs.
const examples = {
  action: { quote: '“Remind me to finish the circuit board.”', result: 'An action', icon: '✓' },
  shopping: { quote: '“We need more oolong tea.”', result: 'A shopping item', icon: '+' },
  calendar: { quote: '“Tea with a friend on Friday.”', result: 'A calendar intention', icon: '▦' }
};
document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => {
    const example = examples[button.dataset.example];
    document.getElementById('voice-quote').textContent = example.quote;
    document.getElementById('voice-result').textContent = example.result;
    document.getElementById('route-icon').textContent = example.icon;
    document.querySelectorAll('[data-example]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
  });
});

// A short, intentionally quiet browser sound sketch, activated only by a user gesture.
let audioContext;
let activeTone;
const soundStatus = document.getElementById('sound-status');
document.querySelectorAll('[data-frequency]').forEach(button => {
  button.addEventListener('click', async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      soundStatus.textContent = 'Sound is not supported in this browser. The original project explores tea as a musical interface.';
      return;
    }
    try {
      audioContext ||= new AudioContextClass();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (activeTone) { activeTone.stop(); activeTone.disconnect(); }
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.value = Number(button.dataset.frequency);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.1);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      activeTone = oscillator;
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        if (activeTone === oscillator) activeTone = null;
      };
      oscillator.start(start);
      oscillator.stop(start + 1.15);
      soundStatus.textContent = `${button.textContent.trim().replace('↗', '')} — a short synthesized tone.`;
      button.classList.remove('played');
      requestAnimationFrame(() => button.classList.add('played'));
    } catch {
      soundStatus.textContent = 'Sound could not start. Try again, or explore the project story below.';
    }
  });
});
