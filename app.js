// ====== CONFIGURAÇÕES E BANCO DE DADOS LOCAL ======
let usersDB = JSON.parse(localStorage.getItem('gym_rpg_users')) || {};
let currentUser = localStorage.getItem('gym_rpg_current_user') || null;
let isRegisterMode = false;

// Catálogo Real de Itens da Loja com Descrições de Contexto RPG Gym
const SHOP_ITEMS = [
    { id: 'elmo_barbaro', name: 'Capuz do Titã de Ferro', type: 'helmet', cost: 40, description: 'Proteção pesada para aguentar as séries mais brutais até a falha.', stats: { attack: 2, defense: 12, magic: 0, intelligence: 0, mobility: -1, tenacity: 15 }, image: 'assets/items/elmo.png' },
    { id: 'colar_foco', name: 'Amuleto de Foco Pré-Treino', type: 'necklace', cost: 60, description: 'Sua mente canaliza energia ancestral pura logo na primeira repetição.', stats: { attack: 5, defense: 0, magic: 20, intelligence: 15, mobility: 5, tenacity: 0 }, image: 'assets/items/colar.png' },
    { id: 'armadura_pesada', name: 'Couraça de Aço Forjado', type: 'armor', cost: 100, description: 'Uma armadura imponente esculpida diretamente do metal fundido de halteres sagrados.', stats: { attack: 0, defense: 40, magic: -5, intelligence: 0, mobility: -5, tenacity: 30 }, image: 'assets/chest.webp' },
    { id: 'halter_ancestral', name: 'Halter Rúnico Maciço', type: 'weapon', cost: 75, description: 'Forjado pelos mestres da hipertrofia mística. Esmaga qualquer estagnação.', stats: { attack: 35, defense: 5, magic: 0, intelligence: 0, mobility: 2, tenacity: 10 }, image: 'assets/espada.png' },
    { id: 'escudo_torre', name: 'Placa de Agachamento Baluarte', type: 'shield', cost: 85, description: 'Suporta a pressão de um agachamento titânico. Defesa impenetrável.', stats: { attack: 0, defense: 50, magic: 0, intelligence: 0, mobility: -8, tenacity: 40 }, image: 'assets/items/escudo.png' },
    { id: 'luvas_atadura', name: 'Glove de Atadura Calejada', type: 'gloves', cost: 30, description: 'Evita calos indesejados e garante aderência divina na barra de combate.', stats: { attack: 12, defense: 5, magic: 0, intelligence: 0, mobility: 8, tenacity: 5 }, image: 'assets/items/luvas.png' },
    { id: 'anel_hipertrofia', name: 'Anel do Bombeamento Supremo', type: 'ring', cost: 120, description: 'Amplifica o fluxo de nutrientes e energia vital por todo o corpo.', stats: { attack: 15, defense: 15, magic: 15, intelligence: 15, mobility: 15, tenacity: 15 }, image: 'assets/items/anel.png' },
    { id: 'botas_rapidas', name: 'Sapatilha do Boxeador Sombra', type: 'boots', cost: 50, description: 'Leveza incomparável. Seus pés se movem antes mesmo do oponente piscar.', stats: { attack: 5, defense: 8, magic: 0, intelligence: 0, mobility: 30, tenacity: 5 }, image: 'assets/items/botas.png' }
];

// ====== SISTEMA DE FEEDBACK VISUAL DE CONFIRMAÇÃO (TOASTS) ======
function showNotification(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let themeClasses = 'bg-slate-900 border-amber-500 text-amber-400 shadow-amber-950/20';
    
    if (type === 'level_up') {
        themeClasses = 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-emerald-950/40 animate-bounce';
    } else if (type === 'equip') {
        themeClasses = 'bg-slate-900 border-blue-500 text-blue-400 shadow-blue-950/20';
    }

    toast.className = `flex items-center gap-3 p-4 rounded-lg border-2 border-double shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 font-bold text-sm tracking-wide min-w-[280px] ${themeClasses}`;
    toast.innerHTML = `<div class="flex-1">${message}</div>`;

    container.appendChild(toast);

    // Fade-in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 20);

    // Fade-out e destruição automática
    setTimeout(() => {
        toast.classList.add('translate-y-[-10px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ====== MOTOR DE TOOLTIPS DINÂMICOS ======
function showTooltip(e, itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const tooltip = document.getElementById('rpg-tooltip');
    if (!tooltip) return;

    const statLabels = { attack: '⚔️ ATQ', defense: '🛡️ DEF', magic: '🔮 MAG', intelligence: '🧠 INT', mobility: '👟 MOB', tenacity: '🪵 TEN' };
    let statsMarkup = '';

    Object.keys(item.stats).forEach(s => {
        const val = item.stats[s];
        if (val !== 0) {
            const color = val > 0 ? 'text-emerald-400' : 'text-red-400';
            const sign = val > 0 ? '+' : '';
            statsMarkup += `<p class="${color} text-xs font-mono">${statLabels[s]}: ${sign}${val}</p>`;
        }
    });

    tooltip.innerHTML = `
        <div class="bg-slate-900 border-2 border-amber-600/70 p-3 rounded-lg shadow-2xl max-w-xs border-double bg-opacity-95 backdrop-blur-xs">
            <h4 class="font-black text-sm text-amber-400 tracking-wide">${item.name}</h4>
            <p class="text-[10px] text-slate-400 italic my-1 leading-tight">${item.description}</p>
            <div class="border-t border-slate-800 pt-1.5 mt-1.5 space-y-0.5">
                ${statsMarkup || '<p class="text-slate-500 text-[10px]">Sem modificadores de status</p>'}
            </div>
        </div>
    `;
    tooltip.classList.remove('hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    const tooltip = document.getElementById('rpg-tooltip');
    if (!tooltip) return;
    
    // Deslocamento para o box não ficar sob o cursor do mouse
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY + 16) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('rpg-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}

// ====== NAVEGAÇÃO SEGURA VANIILA ======
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn-tab').forEach(btn => {
        btn.classList.remove('border-amber-500', 'text-amber-500', 'bg-slate-900');
        btn.classList.add('border-transparent', 'text-slate-400');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-amber-500');
        btn.classList.add('text-slate-400');
    });

    if (element) {
        if (element.classList.contains('nav-btn-tab')) {
            element.classList.add('border-amber-500', 'text-amber-500', 'bg-slate-900');
            element.classList.remove('border-transparent', 'text-slate-400');
        } else if (element.classList.contains('nav-btn')) {
            element.classList.add('text-amber-500');
            element.classList.remove('text-slate-400');
        }
    }
}

// ====== SISTEMA DE AUTENTICAÇÃO ======
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('register-fields').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('btn-primary-auth').innerText = isRegisterMode ? 'Consagrar Registro' : 'Entrar na Guilda';
    document.getElementById('btn-toggle-auth').innerText = isRegisterMode ? 'Já tem linhagem? Faça login' : 'Nova Estirpe? Registre-se aqui';
}

function handlePrimaryAuth() {
    const username = document.getElementById('auth-username').value.trim().toLowerCase();
    if (!username) return alert('Diga o seu nome, herói.');

    if (isRegisterMode) {
        if (usersDB[username]) return alert('Esse herói já caminha por essas terras.');
        
        usersDB[username] = {
            profile: {
                username: username,
                weight: document.getElementById('reg-weight').value || 80,
                height: document.getElementById('reg-height').value || 175,
                gender: document.getElementById('reg-gender').value || 'M'
            },
            level: 1,
            xp: 0,
            coins: 0, // Moedas cravaram em zero para novas contas conforme solicitado
            inventory: [],
            equipped: { helmet: null, necklace: null, shield: null, weapon: null, gloves: null, ring: null, armor: null, boots: null },
            logs: []
        };
        saveDB();
        alert('Registro salvo! Faça login para iniciar sua jornada.');
        toggleAuthMode();
    } else {
        if (!usersDB[username]) return alert('Herói não registrado.');
        currentUser = username;
        localStorage.setItem('gym_rpg_current_user', currentUser);
        loadGame();
    }
}

function logout() {
    localStorage.removeItem('gym_rpg_current_user');
    currentUser = null;
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-game').classList.add('hidden');
}

function saveDB() {
    localStorage.setItem('gym_rpg_users', JSON.stringify(usersDB));
}

function getXpNeeded(level) {
    return Math.round(100 * Math.pow(level, 1.6));
}

// ====== CÁLCULO DE ATRIBUTOS BRUTOS ======
function calculateStats(player) {
    const baseStat = Math.round(player.level * 2.5); 
    let totals = { attack: baseStat, defense: baseStat, magic: baseStat, intelligence: baseStat, mobility: baseStat, tenacity: baseStat };

    Object.keys(player.equipped).forEach(slot => {
        const itemId = player.equipped[slot];
        if (itemId) {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (item) {
                Object.keys(item.stats).forEach(stat => {
                    totals[stat] += item.stats[stat];
                });
            }
        }
    });

    document.getElementById('stat-attack').innerText = totals.attack;
    document.getElementById('stat-defense').innerText = totals.defense;
    document.getElementById('stat-magic').innerText = totals.magic;
    document.getElementById('stat-intelligence').innerText = totals.intelligence;
    document.getElementById('stat-mobility').innerText = totals.mobility;
    document.getElementById('stat-tenacity').innerText = totals.tenacity;
}

// ====== WORKOUT FARM LOGIC ======
function submitWorkout() {
    const player = usersDB[currentUser];
    const activity = document.getElementById('farm-activity').value;
    const duration = parseInt(document.getElementById('farm-duration').value) || 0;

    if (duration <= 0) return alert('Tempo inválido.');

    let xpGain = duration * 3;
    let coinGain = Math.round(duration * 0.8);

    player.xp += xpGain;
    player.coins += coinGain;

    let leveledUp = false;
    while (player.xp >= getXpNeeded(player.level)) {
        player.xp -= getXpNeeded(player.level);
        player.level++;
        leveledUp = true;
    }

    if (leveledUp) {
        showNotification(`🔥 CLASSE ELEVADA! Você alcançou o Nível ${player.level}!`, 'level_up');
    } else {
        showNotification(`💪 Treino salvo! Recebeu +${xpGain} XP e +🪙${coinGain} moedas.`, 'success');
    }

    const now = new Date();
    player.logs.unshift({
        description: `Concluiu: ${document.getElementById('farm-activity').options[document.getElementById('farm-activity').selectedIndex].text}`,
        date: now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        xp: xpGain,
        coins: coinGain
    });

    saveDB();
    updateUI();
}

// ====== INVENTÁRIO E COMPRAS ======
function buyItem(itemId) {
    const player = usersDB[currentUser];
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) return alert('Item místico indisponível nesta era.');
    if (player.inventory.length >= 24) return alert('Bolsa cheia! Desequipe algo.');
    if (player.coins < item.cost) return alert('O mercador exige mais moedas de ouro. Complete missões de treino!');

    player.coins -= item.cost;
    player.inventory.push(item.id);
    
    showNotification(`🛒 Você adquiriu [${item.name}] com sucesso!`, 'success');
    
    saveDB();
    updateUI();
}

function equipItem(itemId) {
    const player = usersDB[currentUser];
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    if (player.equipped[item.type]) {
        player.inventory.push(player.equipped[item.type]);
    }
    
    player.equipped[item.type] = item.id;
    
    const idx = player.inventory.indexOf(itemId);
    if (idx > -1) player.inventory.splice(idx, 1);

    showNotification(`🛡️ Você equipou [${item.name}]. Seus atributos subiram!`, 'equip');

    saveDB();
    updateUI();
}

function unequipItem(slot) {
    const player = usersDB[currentUser];
    const itemId = player.equipped[slot];
    if (!itemId) return;

    if (player.inventory.length >= 24) return alert('Mochila cheia para desequipar.');

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    player.equipped[slot] = null;
    player.inventory.push(itemId);

    if (item) {
        showNotification(`📦 Desequipou [${item.name}]. Item devolvido à bolsa.`, 'equip');
    }

    saveDB();
    updateUI();
}

// ====== RENDER ENGINE ======
function updateUI() {
    const player = usersDB[currentUser];
    if (!player) return;

    // Proteção crucial: Esconde o tooltip ao re-renderizar para evitar caixas fantasmas na tela
    hideTooltip();

    // Dados básicos do HUD
    document.getElementById('char-name').innerText = player.profile.username.toUpperCase();
    document.getElementById('char-level').innerText = player.level;
    document.getElementById('char-coins').innerText = `🪙 ${player.coins}`;
    
    const isMale = player.profile.gender === 'M';
    document.getElementById('hud-avatar-frame').innerText = isMale ? '🧔' : '🛡️';

    document.getElementById('profile-meta-details').innerHTML = `
        <p><strong>Biotipo:</strong> ${isMale ? 'Bárbaro' : 'Valquíria'}</p>
        <p><strong>Massa Corporal:</strong> ${player.profile.weight} kg</p>
        <p><strong>Envergadura:</strong> ${player.profile.height} cm</p>
    `;

    // Atualização da imagem central do Boneco
    const dollCenter = document.getElementById('character-doll-center');
    const fallbackText = document.getElementById('avatar-fallback-visual');
    dollCenter.style.backgroundImage = `url('assets/${isMale ? 'male' : 'female'}.png')`;
    dollCenter.style.backgroundSize = 'contain';
    dollCenter.style.backgroundPosition = 'center';
    dollCenter.style.backgroundRepeat = 'no-repeat';
    fallbackText.innerText = '';

    // Render dos Slots 3x3 com tratamento e injeção de listeners de Tooltip
    const coreSlots = ['helmet', 'necklace', 'shield', 'weapon', 'gloves', 'ring', 'armor', 'boots'];
    const slotNames = { helmet: '🪖 Cabeça', necklace: '📿 Colar', shield: '🛡️ Escudo', weapon: '⚔️ Arma', gloves: '🧤 Luvas', ring: '💍 Anel', armor: '🥋 Peito', boots: '🥾 Pés' };

    coreSlots.forEach(slot => {
        const itemId = player.equipped[slot];
        const el = document.getElementById(`slot-${slot}`);
        if (el) {
            // Reset de Tooltips passados
            el.removeAttribute('onmouseenter');
            el.removeAttribute('onmousemove');
            el.removeAttribute('onmouseleave');

            if (itemId) {
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (item) {
                    el.innerHTML = `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-1" onerror="this.style.display='none'; this.parentElement.innerHTML='✨';">`;
                    el.className = "w-full aspect-square bg-slate-900 border-2 border-amber-500 rounded flex items-center justify-center cursor-pointer shadow-inner";
                    
                    // Vincula os gatilhos do Tooltip no item equipado
                    el.setAttribute('onmouseenter', `showTooltip(event, '${itemId}')`);
                    el.setAttribute('onmousemove', `moveTooltip(event)`);
                    el.setAttribute('onmouseleave', `hideTooltip()`);
                } else {
                    el.innerHTML = slotNames[slot];
                    el.className = "w-full aspect-square bg-slate-900/60 border border-slate-800 rounded flex flex-col items-center justify-center text-[10px] text-slate-500 cursor-default text-center select-none";
                }
            } else {
                el.innerHTML = slotNames[slot];
                el.className = "w-full aspect-square bg-slate-900/60 border border-slate-800 rounded flex flex-col items-center justify-center text-[10px] text-slate-500 cursor-default text-center select-none";
            }
        }
    });

    // Render da Mochila de 24 Slots com Listeners de Tooltip
    const invGrid = document.getElementById('inventory-grid');
    if (invGrid) {
        invGrid.innerHTML = '';
        document.getElementById('bag-count').innerText = `${player.inventory.length} / 24 Slots`;

        for (let i = 0; i < 24; i++) {
            const slotBox = document.createElement('div');
            const itemId = player.inventory[i];
            
            if (itemId) {
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (item) {
                    slotBox.className = "w-full aspect-square bg-slate-900 border border-slate-700 hover:border-amber-400 rounded flex items-center justify-center p-1 cursor-pointer transition shadow-inner";
                    slotBox.innerHTML = `<img src="${item.image}" class="w-full h-full object-contain" onerror="this.style.display='none'; this.parentElement.innerHTML='📦';">`;
                    slotBox.onclick = () => equipItem(itemId);

                    // Vincula os gatilhos do Tooltip na Mochila
                    slotBox.setAttribute('onmouseenter', `showTooltip(event, '${itemId}')`);
                    slotBox.setAttribute('onmousemove', `moveTooltip(event)`);
                    slotBox.setAttribute('onmouseleave', `hideTooltip()`);
                } else {
                    slotBox.className = "w-full aspect-square bg-slate-900 border border-red-900 rounded flex items-center justify-center cursor-pointer";
                    slotBox.innerHTML = '📦';
                }
            } else {
                slotBox.className = "w-full aspect-square bg-slate-950 border border-slate-900/40 rounded shadow-inner";
            }
            invGrid.appendChild(slotBox);
        }
    }

    // Render da Loja de Itens com Listeners de Tooltip atrelados ao Card
    const shopGrid = document.getElementById('shop-grid');
    if (shopGrid) {
        shopGrid.innerHTML = '';
        SHOP_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = "bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md hover:border-slate-700 transition cursor-help";
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-slate-950 border-2 border-amber-600/20 rounded p-1 flex items-center justify-center">
                        <img src="${item.image}" class="w-full h-full object-contain" onerror="this.style.display='none'; this.parentElement.innerHTML='🔮';">
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-slate-200 leading-tight">${item.name}</h4>
                        <p class="text-[10px] text-amber-500 font-bold uppercase mt-0.5">${slotNames[item.type] || item.type}</p>
                    </div>
                </div>
                <button onclick="buyItem('${item.id}'); event.stopPropagation();" class="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs py-2.5 px-4 rounded transition active:scale-95">
                    🪙 ${item.cost}
                </button>
            `;
            
            // Vincula os gatilhos do Tooltip no card inteiro do Mercado
            card.setAttribute('onmouseenter', `showTooltip(event, '${item.id}')`);
            card.setAttribute('onmousemove', `moveTooltip(event)`);
            card.setAttribute('onmouseleave', `hideTooltip()`);

            shopGrid.appendChild(card);
        });
    }

    // Render das Crônicas / Histórico
    const logsContainer = document.getElementById('logs-container');
    if (logsContainer) {
        logsContainer.innerHTML = '';
        player.logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = "bg-slate-950/80 border border-slate-900 p-3 rounded-lg flex justify-between items-center gap-2";
            entry.innerHTML = `
                <div>
                    <p class="font-medium text-slate-300 text-xs sm:text-sm">${log.description}</p>
                    <span class="text-[9px] text-slate-500 font-mono">${log.date}</span>
                </div>
                <div class="text-right font-bold text-xs whitespace-nowrap">
                    <span class="text-emerald-400 block">+${log.xp} XP</span>
                    <span class="text-amber-500 block">+🪙${log.coins}</span>
                </div>
            `;
            logsContainer.appendChild(entry);
        });
    }

    // Atualização da Régua de XP
    const xpTarget = getXpNeeded(player.level);
    document.getElementById('xp-bar').style.width = `${(player.xp / xpTarget) * 100}%`;
    document.getElementById('xp-current').innerText = `${player.xp} XP`;
    document.getElementById('xp-next').innerText = `${xpTarget} XP`;

    calculateStats(player);
}

function loadGame() {
    if (currentUser) {
        const authScreen = document.getElementById('auth-screen');
        const mainGame = document.getElementById('main-game');
        if (authScreen) authScreen.classList.add('hidden');
        if (mainGame) mainGame.classList.remove('hidden');
        updateUI();
    }
}

// Inicializa a aplicação
loadGame();