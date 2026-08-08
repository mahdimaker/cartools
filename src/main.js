// CarTools Vanilla TypeScript Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAiAssistant();
  initSmoothScroll();
});

// Mobile Navigation Menu Toggle Logic
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!btn || !menu) return;

  function toggleMenu() {
    const isOpen = !menu?.classList.contains('hidden');
    if (isOpen) {
      menu?.classList.add('hidden');
      hamburgerIcon?.classList.remove('hidden');
      closeIcon?.classList.add('hidden');
      btn?.setAttribute('aria-expanded', 'false');
    } else {
      menu?.classList.remove('hidden');
      hamburgerIcon?.classList.add('hidden');
      closeIcon?.classList.remove('hidden');
      btn?.setAttribute('aria-expanded', 'true');
    }
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking a link inside
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      hamburgerIcon?.classList.remove('hidden');
      closeIcon?.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target as Node) && !btn.contains(e.target as Node)) {
      menu.classList.add('hidden');
      hamburgerIcon?.classList.remove('hidden');
      closeIcon?.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// AI Assistant Global Widget
function initAiAssistant() {
  const form = document.getElementById('ai-assistant-form');
  const input = document.getElementById('ai-assistant-input') as HTMLInputElement;
  const chatOutput = document.getElementById('ai-assistant-output');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input?.value?.trim();
    if (!query || !chatOutput) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'p-3 rounded-xl bg-slate-800 text-white text-sm max-w-[85%] self-end font-medium shadow-sm';
    userMsg.textContent = query;

    const botLoading = document.createElement('div');
    botLoading.className = 'p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm max-w-[85%] flex items-center gap-2 shadow-sm';
    botLoading.innerHTML = `<div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span>Consulting CarTools AI...</span>`;

    chatOutput.appendChild(userMsg);
    chatOutput.appendChild(botLoading);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    input.value = '';

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'CarTools Assistant',
          query
        })
      });
      const data = await res.json();
      botLoading.className = 'p-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm max-w-[90%] shadow-sm leading-relaxed';
      botLoading.innerHTML = `<span class="font-semibold text-blue-600 block mb-1">🤖 CarTools AI:</span>${data.insight}`;
    } catch (err) {
      botLoading.className = 'p-3 rounded-xl bg-red-50 text-red-700 text-sm';
      botLoading.textContent = 'Vehicle AI assistant is offline. Check internet connection.';
    }
    chatOutput.scrollTop = chatOutput.scrollHeight;
  });
}

// Smooth scrolling for navigation anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        targetElement?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
