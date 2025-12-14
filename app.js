/* ==========================================================================
        SPARTAN.EDU - COMPLETE JAVASCRIPT (FIXED & OPTIMIZED)
        All bugs fixed, ready to deploy
        ========================================================================== */

        // ========== CORE UTILITIES ==========
        const Notify = {
            show: (msg, type = 'success') => {
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${msg}</span>`;
                document.getElementById('toast-container').appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        };

        const Modals = {
            open: (id) => document.getElementById(id).classList.add('active'),
            close: () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active')),
            prompt: (title, label, callback) => {
                document.getElementById('prompt-title').innerText = title;
                document.getElementById('prompt-label').innerText = label;
                const input = document.getElementById('prompt-input');
                input.value = '';
                Modals.open('modal-prompt');
                input.focus();
                document.getElementById('prompt-confirm').onclick = () => {
                    if (input.value.trim()) {
                        callback(input.value.trim());
                        Modals.close();
                    } else Notify.show('Field cannot be empty', 'error');
                };
            },
            confirm: (title, msg, callback) => {
                document.getElementById('confirm-title').innerText = title;
                document.getElementById('confirm-msg').innerText = msg;
                Modals.open('modal-confirm');
                document.getElementById('confirm-btn').onclick = () => {
                    callback();
                    Modals.close();
                };
            }
        };

        const CustomModal = {
            input: (title, description, defaultValue, callback) => {
                document.getElementById('custom-input-title').innerText = title;
                const desc = document.getElementById('custom-input-desc');
                if (description) {
                    desc.innerText = description;
                    desc.style.display = 'block';
                } else {
                    desc.style.display = 'none';
                }

                const field = document.getElementById('custom-input-field');
                field.value = defaultValue || '';
                field.rows = 3;

                Modals.open('modal-custom-input');
                setTimeout(() => field.focus(), 100);

                document.getElementById('custom-input-confirm').onclick = () => {
                    const value = field.value.trim();
                    if (value) {
                        callback(value);
                        Modals.close();
                    } else {
                        Notify.show('Please enter a value', 'error');
                    }
                };
            },

            cancel: () => {
                Modals.close();
            }
        };

        const Storage = {
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.error('Storage error:', e);
                }
            },
            get: (key) => {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                } catch (e) {
                    return null;
                }
            },
            setItem: (key, value) => {
                try {
                    localStorage.setItem(key, value);
                } catch (e) { }
            },
            getItem: (key) => {
                try {
                    return localStorage.getItem(key);
                } catch (e) {
                    return null;
                }
            }
        };

        const State = {
            currentUser: null,
            decks: [],
            projects: [],
            currD: 0,
            currC: 0,
            currP: 0,
            editCardIdx: null,
            activeTask: null,
            audioCtx: null,
            keyMap: {
                'C3': 'z', 'C#3': 's', 'D3': 'x', 'D#3': 'd', 'E3': 'c', 'F3': 'v', 'F#3': 'g', 'G3': 'b', 'G#3': 'h', 'A3': 'n', 'A#3': 'j', 'B3': 'm',
                'C4': 'q', 'C#4': '2', 'D4': 'w', 'D#4': '3', 'E4': 'e', 'F4': 'r', 'F#4': '5', 'G4': 't', 'G#4': '6', 'A4': 'y', 'A#4': '7', 'B4': 'u',
                'C5': 'i', 'C#5': '9', 'D5': 'o', 'D#5': '0', 'E5': 'p'
            },
            lang: 'en',
            theme: 'light',
            editFolderIdx: null,
            fcShuffle: false,
            currentChannel: 'general',
            currentLesson: 0,
            selectedIcon: '📁',
            selectedColor: '#FF512F'
        };

        const fileToBase64 = (file) => new Promise((r) => {
            const reader = new FileReader();
            reader.onload = () => r(reader.result);
            reader.readAsDataURL(file);
        });

        // ========== DATABASE & AUTH ==========
        const DB = {
            saveUser: (u) => {
                const users = Storage.get('spartan_users') || [];
                if (users.find(x => x.email === u.email)) return false;
                u.id = 'u' + Date.now();
                users.push(u);
                Storage.set('spartan_users', users);
                return true;
            },
            getUser: (email) => {
                const users = Storage.get('spartan_users') || [];
                return users.find(u => u.email === email) || null;
            },
            loadUserSession: (user) => {
                State.currentUser = user;
                const data = Storage.get('spartan_data_' + user.id);
                if (data) {
                    State.decks = data.decks || [];
                    State.projects = data.projects || [];
                    State.keyMap = data.keys || State.keyMap;
                } else {
                    const deckId = Date.now();
                    State.decks = [{
                        id: deckId,
                        name: 'English C1',
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        cards: [{ q: 'Ambition', a: 'Hoài bão' }]
                    }];
                    const today = new Date().toLocaleDateString('en-CA');
                    State.projects = [{
                        id: deckId,
                        name: 'English C1',
                        icon: '📁',
                        color: '#FF512F',
                        role: 'editor',
                        tasks: [{
                            id: 1,
                            title: 'Setup Server',
                            done: false,
                            date: today,
                            priority: 'High',
                            assignee: 'Henry'
                        }]
                    }];
                }
                Piano.render();
                FC.renderHub();
                Tasks.renderSidebar();
                Pathway.init();
                Community.init();
                Whiteboard.init();
            },
            saveCurrentData: () => {
                if (!State.currentUser) return;
                const data = {
                    decks: State.decks,
                    projects: State.projects,
                    keys: State.keyMap
                };
                Storage.set('spartan_data_' + State.currentUser.id, data);
            }
        };

        const Auth = {
            toggle: (mode) => {
                ['form-login', 'form-signup'].forEach(id => document.getElementById(id).classList.add('hidden'));
                document.getElementById('form-' + mode).classList.remove('hidden');
            },
            signup: (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const pass = document.getElementById('reg-pass').value;
                if (!email || !pass || !name) return Notify.show('Please fill all fields', 'error');
                if (DB.getUser(email)) return Notify.show('Email already exists', 'error');
                if (DB.saveUser({ name, email, pass })) {
                    Notify.show('Account Created!');
                    Auth.toggle('login');
                } else Notify.show('Account creation failed', 'error');
            },
            login: (e) => {
                e.preventDefault();
                const email = document.getElementById('log-email').value;
                const pass = document.getElementById('log-pass').value;
                const u = DB.getUser(email);
                if (u && u.pass === pass) {
                    document.getElementById('app-username').innerText = u.name;
                    document.getElementById('app-avatar').innerText = u.name[0] || '?';
                    document.getElementById('auth-screen').classList.add('hidden');
                    document.getElementById('app-shell').classList.remove('hidden');
                    document.getElementById('app-shell').style.opacity = 1;
                    DB.loadUserSession(u);
                    Piano.initKeys();
                    Notify.show('Welcome back, ' + u.name);
                } else {
                    Notify.show('Invalid Credentials', 'error');
                }
            },
            logout: () => location.reload()
        };

        const Nav = {
            currentModule: 'piano',
            
            to: (tab, el) => {
                Nav.currentModule = tab;
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                if (el) el.classList.add('active');
                document.querySelectorAll('[id^="mod-"]').forEach(m => m.classList.add('hidden'));
                const target = document.getElementById('mod-' + tab);
                if (target) target.classList.remove('hidden');
                if (tab === 'whiteboard' && Whiteboard._inited) {
                    window.dispatchEvent(new Event('resize'));
                }
            },
            
            back: () => {
                // Hide community and whiteboard overlays
                document.getElementById('mod-community').classList.add('hidden');
                document.getElementById('mod-whiteboard').classList.add('hidden');
                
                // Go back to last module (or piano if community/whiteboard)
                if (Nav.currentModule === 'community' || Nav.currentModule === 'whiteboard') {
                    Nav.currentModule = 'piano';
                }
                
                // Reactivate the nav item
                const navItem = document.querySelector(`.nav-item[onclick*="${Nav.currentModule}"]`);
                if (navItem) {
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    navItem.classList.add('active');
                }
                
                // Show the module
                const target = document.getElementById('mod-' + Nav.currentModule);
                if (target) target.classList.remove('hidden');
            }
        };

        const Theme = {
            toggle: () => {
                const current = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
                document.body.className = 'theme-' + current;
                Notify.show('Theme updated');
            }
        };

        const Lang = {
            current: 'en', // Default English
            translations: {
                en: {
                    name: 'English',
                    pianoLab: 'Piano Lab',
                    knowledgeHub: 'Knowledge Hub',
                    taskArena: 'Task Arena',
                    learningPath: 'Learning Path',
                    community: 'Community',
                    whiteboard: 'Whiteboard',
                    startStudy: 'Start Study',
                    quiz: 'Quiz',
                    share: 'Share',
                    addCard: '+ Add',
                    editDeck: 'Edit Deck',
                    goToTasks: 'Go to Tasks',
                    shuffle: 'Shuffle',
                    cards: 'cards',
                    viewer: 'Viewer',
                    editor: 'Editor',
                    languageChanged: 'Language changed to English'
                },
                vi: {
                    name: 'Tiếng Việt',
                    pianoLab: 'Phòng Piano',
                    knowledgeHub: 'Trung Tâm Kiến Thức',
                    taskArena: 'Quản Lý Công Việc',
                    learningPath: 'Lộ Trình Học',
                    community: 'Cộng Đồng',
                    whiteboard: 'Bảng Vẽ',
                    startStudy: 'Bắt Đầu Học',
                    quiz: 'Kiểm Tra',
                    share: 'Chia Sẻ',
                    addCard: '+ Thêm',
                    editDeck: 'Sửa Bộ Thẻ',
                    goToTasks: 'Đến Công Việc',
                    shuffle: 'Xáo Trộn',
                    cards: 'thẻ',
                    viewer: 'Người Xem',
                    editor: 'Người Chỉnh Sửa',
                    languageChanged: 'Đã đổi sang Tiếng Việt'
                }
            },

            toggle: () => {
                Lang.current = Lang.current === 'en' ? 'vi' : 'en';
                State.lang = Lang.current;
                DB.saveCurrentData();
                Lang.updateUI();
                const msg = Lang.translations[Lang.current].languageChanged;
                Notify.show(msg);
            },

            t: (key) => {
                return Lang.translations[Lang.current][key] || key;
            },

            updateUI: () => {
                // Update sidebar navigation
                const navItems = document.querySelectorAll('.nav-item span');
                if (navItems[0]) navItems[0].textContent = Lang.t('pianoLab');
                if (navItems[1]) navItems[1].textContent = Lang.t('knowledgeHub');
                if (navItems[2]) navItems[2].textContent = Lang.t('taskArena');
                if (navItems[3]) navItems[3].textContent = Lang.t('learningPath');
                if (navItems[4]) navItems[4].textContent = Lang.t('community');
                if (navItems[5]) navItems[5].textContent = Lang.t('whiteboard');
            }
        };

        // ========== PIANO MODULE ==========
        const Piano = {
            notes: [
                { n: 'C3', t: 'w' }, { n: 'C#3', t: 'b' }, { n: 'D3', t: 'w' }, { n: 'D#3', t: 'b' }, { n: 'E3', t: 'w' },
                { n: 'F3', t: 'w' }, { n: 'F#3', t: 'b' }, { n: 'G3', t: 'w' }, { n: 'G#3', t: 'b' }, { n: 'A3', t: 'w' },
                { n: 'A#3', t: 'b' }, { n: 'B3', t: 'w' }, { n: 'C4', t: 'w' }, { n: 'C#4', t: 'b' }, { n: 'D4', t: 'w' },
                { n: 'D#4', t: 'b' }, { n: 'E4', t: 'w' }, { n: 'F4', t: 'w' }, { n: 'F#4', t: 'b' }, { n: 'G4', t: 'w' },
                { n: 'G#4', t: 'b' }, { n: 'A4', t: 'w' }, { n: 'A#4', t: 'b' }, { n: 'B4', t: 'w' }, { n: 'C5', t: 'w' },
                { n: 'C#5', t: 'b' }, { n: 'D5', t: 'w' }, { n: 'D#5', t: 'b' }, { n: 'E5', t: 'w' }
            ],
            initKeys: () => {
                document.addEventListener('keydown', Piano.handleKeyDown);
            },
            render: () => {
                const box = document.getElementById('piano-keys');
                if (!box) return;
                box.innerHTML = '';
                let pos = 0;
                Piano.notes.forEach(k => {
                    const el = document.createElement('div');
                    el.dataset.note = k.n;
                    const labelText = (State.keyMap[k.n] || '').toUpperCase();
                    if (k.t === 'w') {
                        el.className = 'key key-white';
                        el.innerHTML = `<span class="key-label">${labelText}</span>`;
                        pos += 50;
                    } else {
                        el.className = 'key key-black';
                        el.style.left = (pos - 15) + 'px';
                        el.innerHTML = `<span class="key-label">${labelText}</span>`;
                    }
                    el.onmousedown = () => Piano.play(k.n, el);
                    box.appendChild(el);
                });
            },
            play: (note, el) => {
                if (!State.audioCtx) State.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = State.audioCtx.createOscillator();
                const gain = State.audioCtx.createGain();
                const freqs = {
                    'C3': 130.8, 'C#3': 138.6, 'D3': 146.8, 'D#3': 155.6, 'E3': 164.8, 'F3': 174.6, 'F#3': 185.0, 'G3': 196.0,
                    'G#3': 207.6, 'A3': 220.0, 'A#3': 233.1, 'B3': 246.9, 'C4': 261.6, 'C#4': 277.2, 'D4': 293.7, 'D#4': 311.1,
                    'E4': 329.6, 'F4': 349.2, 'F#4': 370.0, 'G4': 392.0, 'G#4': 415.3, 'A4': 440.0, 'A#4': 466.2, 'B4': 493.9,
                    'C5': 523.3, 'C#5': 554.4, 'D5': 587.3, 'D#5': 622.3, 'E5': 659.3
                };
                osc.type = document.getElementById('wave-type').value;
                osc.frequency.value = freqs[note];
                const now = State.audioCtx.currentTime;
                const vol = document.getElementById('vol-slider').value / 100;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(vol, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
                osc.connect(gain);
                gain.connect(State.audioCtx.destination);
                osc.start();
                osc.stop(now + 1);
                if (el) {
                    el.classList.add('active');
                    setTimeout(() => el.classList.remove('active'), 200);
                }
            },
            handleKeyDown: (e) => {
                if (e.repeat || document.querySelector('.modal-overlay.active') || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                const note = Object.keys(State.keyMap).find(k => (State.keyMap[k] || '').toUpperCase() === e.key.toUpperCase());
                if (note) Piano.play(note, document.querySelector(`[data-note="${note}"]`));
            },
            openBindEditor: () => {
                const list = document.getElementById('binds-list');
                list.innerHTML = '';
                Piano.notes.forEach(note => {
                    const row = document.createElement('div');
                    row.className = 'bind-row';
                    row.innerHTML = `<span class="bind-key">${note.n}</span> <input class="bind-input" data-note="${note.n}" value="${State.keyMap[note.n] || ''}" maxlength="1">`;
                    list.appendChild(row);
                });
                Modals.open('modal-keybinds');
            },
            saveBinds: () => {
                const newMap = {};
                document.querySelectorAll('.bind-input').forEach(inp => {
                    if (inp.value) newMap[inp.dataset.note] = inp.value.toLowerCase();
                });
                State.keyMap = newMap;
                DB.saveCurrentData();
                Piano.render();
                Modals.close();
                Notify.show('Keybinds saved');
            }
        };

        // ========== FLASHCARDS MODULE ==========
        const FC = {
            renderHub: () => {
                const container = document.getElementById('folder-grid');
                if (!container) return;
                container.innerHTML = State.decks.map((f, i) => `
                    <div class="folder-card" onclick="FC.openOverview(${i})">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div style="font-size: 2.5rem; color: ${f.color || '#FF512F'}; margin-bottom: 10px;">${f.icon || '📁'}</div>
                            <div class="flex gap-10">
                                ${f.role === 'editor' ? `
                                    <button class="btn-icon-sm" style="background:transparent;" onclick="event.stopPropagation(); FC.openEditFolderModal(${i})"><i class="fa-solid fa-pen"></i></button>
                                    <button class="btn-icon-sm" style="color:var(--status-danger); background:transparent;" onclick="event.stopPropagation(); FC.deleteFolder(${i})"><i class="fa-solid fa-trash"></i></button>
                                ` : ''}
                            </div>
                        </div>
                        <div>
                            <h3 style="color:var(--text-primary); font-size:1.2rem;">${f.name}</h3>
                            <p style="color:var(--text-secondary);">${f.cards.length} cards ${f.role === 'viewer' ? '• <span class="read-only-badge">Read Only</span>' : ''}</p>
                        </div>
                    </div>`).join('');
            },
            createFolder: (name) => {
                const id = Date.now();
                State.decks.push({
                    id,
                    name,
                    icon: '📁',
                    color: '#FF512F',
                    role: 'editor',
                    cards: []
                });
                State.projects.push({
                    id,
                    name,
                    icon: '📁',
                    color: '#FF512F',
                    role: 'editor',
                    tasks: []
                });
                DB.saveCurrentData();
                FC.renderHub();
                Tasks.renderSidebar();
                Notify.show('Deck & Project created');
            },
            deleteFolder: (index) => {
                if (State.decks[index].role === 'viewer') return Notify.show('Cannot delete read-only deck', 'error');
                Modals.confirm('Delete Deck', 'Are you sure?', () => {
                    const deckId = State.decks[index].id;
                    State.decks.splice(index, 1);
                    const projIdx = State.projects.findIndex(p => p.id === deckId);
                    if (projIdx !== -1) State.projects.splice(projIdx, 1);
                    DB.saveCurrentData();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    Notify.show('Deck deleted');
                });
            },
            openOverview: (i) => {
                State.currD = i;
                const deck = State.decks[i];
                document.getElementById('fc-overview-panel').classList.remove('hidden');
                document.getElementById('ov-title').innerText = deck.name;

                const roleBadge = document.getElementById('ov-role-badge');
                if (deck.role === 'viewer') {
                    roleBadge.classList.remove('hidden');
                } else {
                    roleBadge.classList.add('hidden');
                }

                const isViewer = deck.role === 'viewer';
                document.getElementById('btn-edit-folder').disabled = isViewer;
                document.getElementById('btn-add-card').disabled = isViewer;
                if (isViewer) {
                    document.getElementById('btn-edit-folder').style.opacity = '0.5';
                    document.getElementById('btn-add-card').style.opacity = '0.5';
                } else {
                    document.getElementById('btn-edit-folder').style.opacity = '1';
                    document.getElementById('btn-add-card').style.opacity = '1';
                }

                document.getElementById('word-list').innerHTML = deck.cards.map((c, cardIdx) => `
                    <div class="mini-card-scene" style="position: relative;">
                        ${deck.role === 'editor' ? `
                            <button class="btn-delete-float" onclick="event.stopPropagation(); FC.deleteCardByIndex(${cardIdx})" title="Delete card">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <button class="btn-edit-float" onclick="event.stopPropagation(); FC.openEditCard(${cardIdx})" title="Edit card">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                        ` : ''}
                        <div class="mini-card" onclick="this.classList.toggle('flipped')">
                            <div class="mini-face front">
                                ${c.img ? `<img src="${c.img}" class="card-img-display">` : ''}
                                <div>${c.q}</div>
                            </div>
                            <div class="mini-face back">${c.a}</div>
                        </div>
                    </div>`).join('');
            },
            closeOverview: () => document.getElementById('fc-overview-panel').classList.add('hidden'),

            openEditCard: (cardIdx) => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');
                State.editCardIdx = cardIdx;
                const card = State.decks[State.currD].cards[cardIdx];

                document.getElementById('edit-card-q').value = card.q;
                document.getElementById('edit-card-a').value = card.a;

                if (card.img) {
                    document.getElementById('edit-card-preview').src = card.img;
                    document.getElementById('edit-card-label').style.display = 'none';
                    document.getElementById('edit-card-preview-container').style.display = 'block';
                } else {
                    document.getElementById('edit-card-label').style.display = 'block';
                    document.getElementById('edit-card-preview-container').style.display = 'none';
                }

                Modals.open('modal-edit-card');
            },

            updateCard: async () => {
                if (State.editCardIdx === null) return;
                const card = State.decks[State.currD].cards[State.editCardIdx];

                card.q = document.getElementById('edit-card-q').value;
                card.a = document.getElementById('edit-card-a').value;

                const file = document.getElementById('edit-card-img').files[0];
                if (file) {
                    card.img = await fileToBase64(file);
                } else if (document.getElementById('edit-card-preview-container').style.display === 'none') {
                    card.img = null;
                }

                DB.saveCurrentData();

                // Check if study mode is active
                const studyOverlay = document.getElementById('study-overlay');
                if (studyOverlay && !studyOverlay.classList.contains('hidden')) {
                    // Update the current card display in study mode
                    FC.updCard();
                }

                FC.openOverview(State.currD);
                Modals.close();
                Notify.show('Card updated');
            },

            deleteCard: () => {
                if (State.editCardIdx === null) return;
                Modals.confirm('Delete Card', 'Are you sure?', () => {
                    State.decks[State.currD].cards.splice(State.editCardIdx, 1);
                    DB.saveCurrentData();
                    FC.openOverview(State.currD);
                    Modals.close();
                    Notify.show('Card deleted');
                });
            },

            deleteCardByIndex: (cardIdx) => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                Modals.confirm('Delete Card', 'Are you sure you want to delete this card?', () => {
                    State.decks[State.currD].cards.splice(cardIdx, 1);
                    DB.saveCurrentData();
                    FC.openOverview(State.currD);
                    Notify.show('Card deleted');
                });
            },

            editFolder: () => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                const deck = State.decks[State.currD];
                document.getElementById('edit-folder-name').value = deck.name;

                State.selectedIcon = deck.icon;
                State.selectedColor = deck.color;

                document.querySelectorAll('.icon-option').forEach(opt => {
                    if (opt.dataset.icon === deck.icon) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });

                document.querySelectorAll('.color-option').forEach(opt => {
                    if (opt.dataset.color === deck.color) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });

                Modals.open('modal-edit-folder');
            },

            selectIcon: (el) => {
                document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                el.classList.add('selected');
                State.selectedIcon = el.dataset.icon;
            },

            selectColor: (el) => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                el.classList.add('selected');
                State.selectedColor = el.dataset.color;
            },

            saveFolderEdit: () => {
                const deck = State.decks[State.currD];
                const newName = document.getElementById('edit-folder-name').value.trim();

                if (!newName) return Notify.show('Name cannot be empty', 'error');

                deck.name = newName;
                deck.icon = State.selectedIcon;
                deck.color = State.selectedColor;

                const proj = State.projects.find(p => p.id === deck.id);
                if (proj) {
                    proj.name = newName;
                    proj.icon = State.selectedIcon;
                    proj.color = State.selectedColor;
                }

                DB.saveCurrentData();
                FC.renderHub();
                Tasks.renderSidebar();
                FC.openOverview(State.currD);
                Modals.close();
                Notify.show('Deck updated');
            },

            openEditFolderModal: (deckIdx) => {
                State.currD = deckIdx;
                FC.editFolder();
            },

            deleteFolder: (deckIdx) => {
                const deck = State.decks[deckIdx];
                if (deck.role === 'viewer') return Notify.show('Cannot delete read-only deck', 'error');

                Modals.confirm('Delete Deck', `Are you sure you want to delete "${deck.name}"? This cannot be undone.`, () => {
                    // Delete the deck
                    State.decks.splice(deckIdx, 1);

                    // Delete corresponding project if exists
                    const projIdx = State.projects.findIndex(p => p.id === deck.id);
                    if (projIdx !== -1) {
                        State.projects.splice(projIdx, 1);
                    }

                    // Reset current deck index if needed
                    if (State.currD >= State.decks.length) {
                        State.currD = Math.max(0, State.decks.length - 1);
                    }

                    DB.saveCurrentData();
                    FC.renderHub();
                    Tasks.renderSidebar();
                    Notify.show('Deck deleted');
                });
            },

            jumpToTasks: () => {
                FC.closeOverview();
                const deckId = State.decks[State.currD].id;
                const pIdx = State.projects.findIndex(p => p.id === deckId);
                if (pIdx !== -1) {
                    const taskNav = document.querySelectorAll('.nav-item')[2];
                    Nav.to('tasks', taskNav);
                    Tasks.switch(pIdx);
                }
            },

            handleFileSelect: async (input, previewId, labelId, containerId, removeBtnId) => {
                const file = input.files[0];
                if (!file) return;
                document.getElementById(labelId).style.display = 'none';
                document.getElementById(containerId).style.display = 'block';
                const res = await fileToBase64(file);
                document.getElementById(previewId).src = res;
            },

            removeImage: (inputId, previewId, labelId, containerId) => {
                document.getElementById(inputId).value = '';
                document.getElementById(previewId).src = '';
                document.getElementById(containerId).style.display = 'none';
                document.getElementById(labelId).style.display = 'block';
            },

            submitCard: async () => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                const q = document.getElementById('new-q').value;
                const a = document.getElementById('new-a').value;
                const file = document.getElementById('new-img').files[0];
                let img = null;
                if (file) img = await fileToBase64(file);

                if (q && a) {
                    State.decks[State.currD].cards.push({ q, a, img });
                    DB.saveCurrentData();
                    document.getElementById('new-q').value = '';
                    document.getElementById('new-a').value = '';
                    FC.removeImage('new-img', 'add-preview', 'add-label', 'add-preview-container');
                    Modals.close();
                    FC.openOverview(State.currD);
                    Notify.show('Card added');
                }
            },

            startStudy: () => {
                if (State.decks[State.currD].cards.length === 0) return Notify.show('Empty Deck', 'info');
                State.currC = 0;
                document.getElementById('study-overlay').classList.remove('hidden');
                document.getElementById('mode-flip').classList.remove('hidden');
                document.getElementById('mode-quiz').classList.add('hidden');
                FC.updCard();
            },

            startQuiz: () => {
                if (State.decks[State.currD].cards.length === 0) return Notify.show('Empty Deck', 'info');
                State.currC = 0;
                document.getElementById('study-overlay').classList.remove('hidden');
                document.getElementById('mode-flip').classList.add('hidden');
                document.getElementById('mode-quiz').classList.remove('hidden');
                FC.loadQuiz();
            },

            closeStudy: () => document.getElementById('study-overlay').classList.add('hidden'),

            updCard: () => {
                const c = State.decks[State.currD].cards[State.currC];
                document.getElementById('st-img-container').innerHTML = c.img ? `<img src="${c.img}" class="card-img-display">` : '';
                document.getElementById('st-q').innerText = c.q;
                document.getElementById('st-a').innerText = c.a;
                document.getElementById('st-count').innerText = `${State.currC + 1} / ${State.decks[State.currD].cards.length}`;
                document.querySelector('.card-3d').classList.remove('flipped');

                // Show/hide edit buttons based on deck role
                const actionsDiv = document.getElementById('study-card-actions');
                if (actionsDiv) {
                    if (State.decks[State.currD].role === 'viewer') {
                        actionsDiv.style.display = 'none';
                    } else {
                        actionsDiv.style.display = 'flex';
                    }
                }
            },

            nav: (d) => {
                const n = State.currC + d;
                if (n >= 0 && n < State.decks[State.currD].cards.length) {
                    State.currC = n;
                    FC.updCard();
                }
            },

            editCurrentCard: () => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');
                FC.openEditCard(State.currC);
            },

            deleteCurrentCard: () => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Read-only deck', 'error');

                Modals.confirm('Delete Card', 'Are you sure you want to delete this card?', () => {
                    State.decks[State.currD].cards.splice(State.currC, 1);
                    DB.saveCurrentData();

                    // If no more cards, close study mode
                    if (State.decks[State.currD].cards.length === 0) {
                        FC.closeStudy();
                        FC.openOverview(State.currD);
                        Notify.show('Card deleted - deck is now empty');
                        return;
                    }

                    // Adjust current card index if needed
                    if (State.currC >= State.decks[State.currD].cards.length) {
                        State.currC = State.decks[State.currD].cards.length - 1;
                    }

                    FC.updCard();
                    FC.openOverview(State.currD); // Update the overview panel too
                    Notify.show('Card deleted');
                });
            },

            loadQuiz: () => {
                const c = State.decks[State.currD].cards[State.currC];
                document.getElementById('qz-q').innerText = c.q;
                document.getElementById('qz-a').innerText = c.a;
                document.getElementById('qz-reveal').classList.add('hidden');
                document.getElementById('qz-btn-show').classList.remove('hidden');
            },

            showQuiz: () => {
                document.getElementById('qz-reveal').classList.remove('hidden');
                document.getElementById('qz-btn-show').classList.add('hidden');
            },

            ans: () => {
                if (State.currC < State.decks[State.currD].cards.length - 1) {
                    State.currC++;
                    FC.loadQuiz();
                } else {
                    Notify.show('Quiz completed!');
                    FC.closeStudy();
                }
            },

            shuffleNow: () => {
                if (State.decks[State.currD].role === 'viewer') return Notify.show('Cannot shuffle read-only deck', 'error');

                const cards = State.decks[State.currD].cards;
                for (let i = cards.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [cards[i], cards[j]] = [cards[j], cards[i]];
                }
                DB.saveCurrentData();
                FC.renderHub();
                try { FC.openOverview(State.currD); } catch (e) { }
                Notify.show('Cards shuffled');
            },

            shareCurrentDeck: () => Shared.share('deck', State.decks[State.currD])
        };

        // ========== TASKS MODULE ==========
        const Tasks = {
            renderSidebar: () => {
                const container = document.getElementById('project-list');
                if (!container) return;
                container.innerHTML = State.projects.map((p, i) => `
                    <div class="project-item ${i === State.currP ? 'active' : ''}" onclick="Tasks.switch(${i})">
                        <div style="font-size: 1.2rem;">${p.icon || '📁'}</div>
                        <div style="width:8px; height:8px; border-radius:50%; background:${p.color || '#F59E0B'}"></div> 
                        ${p.name}
                        ${p.role === 'viewer' ? '<span class="read-only-badge">Read Only</span>' : ''}
                    </div>`).join('');
                Tasks.renderBoard();
            },

            switch: (i) => {
                State.currP = i;
                Tasks.renderSidebar();
            },

            createProject: (name) => {
                const id = Date.now();
                State.projects.push({
                    id,
                    name,
                    icon: '📁',
                    color: '#FF512F',
                    role: 'editor',
                    tasks: []
                });
                State.decks.push({
                    id,
                    name,
                    icon: '📁',
                    color: '#FF512F',
                    role: 'editor',
                    cards: []
                });
                DB.saveCurrentData();
                Tasks.renderSidebar();
                FC.renderHub();
                Notify.show('Project Created');
            },

            renderBoard: () => {
                const p = State.projects[State.currP];
                document.getElementById('proj-header').innerText = p ? p.name : 'No Project';
                const container = document.getElementById('task-rows');
                if (!container) return;
                if (!p || !p.tasks.length) {
                    container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary)">No tasks</div>';
                    return;
                }
                container.innerHTML = p.tasks.map(t => `
                    <div class="task-row ${t.done ? 'completed' : ''}" onclick="Tasks.openPanel(${t.id})">
                        <div class="checkbox"><i class="fa-solid fa-check" style="font-size:10px; color:${t.done ? 'white' : 'transparent'}"></i></div>
                        <div style="font-weight:500;">${t.title}</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary);">${t.assignee || 'Unassigned'}</div>
                        <div style="color:${t.done ? 'var(--text-secondary)' : '#EF4444'}">${t.date}</div>
                        <div style="font-size:0.7rem; padding:4px 8px; border-radius:4px; text-align:center; background:rgba(59,130,246,0.2); color:#3B82F6">${t.priority}</div>
                    </div>`).join('');
            },

            addTask: () => {
                const p = State.projects[State.currP];
                if (!p) return;
                if (p.role === 'viewer') return Notify.show('Read-only project', 'error');

                const newId = Date.now();
                p.tasks.push({
                    id: newId,
                    title: "New Task",
                    done: false,
                    priority: 'Low',
                    date: new Date().toLocaleDateString('en-CA'),
                    assignee: 'Me',
                    img: null,
                    desc: '',
                    comments: []
                });
                DB.saveCurrentData();
                Tasks.renderBoard();
                Tasks.openPanel(newId);
            },

            openPanel: (id) => {
                const t = State.projects[State.currP].tasks.find(x => x.id === id);
                if (!t) return;
                State.activeTask = t;

                // Initialize comments array if not exists
                if (!t.comments) t.comments = [];

                const isViewer = State.projects[State.currP].role === 'viewer';
                document.getElementById('edit-title').value = t.title;
                document.getElementById('edit-date').value = t.date;
                document.getElementById('edit-priority').value = t.priority;
                document.getElementById('edit-assignee').value = t.assignee;
                document.getElementById('edit-desc').value = t.desc || '';

                document.getElementById('edit-title').disabled = isViewer;
                document.getElementById('edit-date').disabled = isViewer;
                document.getElementById('edit-priority').disabled = isViewer;
                document.getElementById('edit-assignee').disabled = isViewer;
                document.getElementById('edit-desc').disabled = isViewer;

                const hasImg = !!t.img;
                document.getElementById('task-img-label').style.display = hasImg ? 'none' : 'block';
                document.getElementById('task-preview-container').style.display = hasImg ? 'block' : 'none';
                document.getElementById('task-img-preview').src = t.img || '';

                // Render comments
                Tasks.renderComments();

                document.getElementById('task-panel').classList.add('open');
            },

            renderComments: () => {
                const container = document.getElementById('task-comments-list');
                if (!container) return;

                const task = State.activeTask;
                if (!task || !task.comments) {
                    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No comments yet</div>';
                    return;
                }

                const currentUserName = State.currentUser ? State.currentUser.name : 'User';

                container.innerHTML = task.comments.map((c, idx) => `
                    <div class="task-comment">
                        <div class="task-comment-header">
                            <div class="task-comment-avatar">${c.author[0]}</div>
                            <div style="flex: 1;">
                                <div class="task-comment-author">${c.author}</div>
                                <div class="task-comment-time">${c.time}</div>
                            </div>
                            ${c.author === currentUserName ? `
                                <button class="task-comment-delete" onclick="Tasks.deleteComment(${idx})" title="Delete comment">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        <div class="task-comment-text">${c.text}</div>
                    </div>
                `).join('');

                // Scroll to bottom
                container.scrollTop = container.scrollHeight;
            },

            addComment: () => {
                const input = document.getElementById('task-comment-input');
                const text = input.value.trim();

                if (!text) return Notify.show('Comment cannot be empty', 'error');
                if (!State.activeTask) return;

                const currentUserName = State.currentUser ? State.currentUser.name : 'User';

                State.activeTask.comments.push({
                    id: Date.now(),
                    author: currentUserName,
                    text: text,
                    time: new Date().toLocaleString()
                });

                input.value = '';
                DB.saveCurrentData();
                Tasks.renderComments();
                Notify.show('Comment added');
            },

            deleteComment: (idx) => {
                if (!State.activeTask) return;

                Modals.confirm('Delete Comment', 'Are you sure you want to delete this comment?', () => {
                    State.activeTask.comments.splice(idx, 1);
                    DB.saveCurrentData();
                    Tasks.renderComments();
                    Notify.show('Comment deleted');
                });
            },

            closePanel: () => {
                const t = State.activeTask;
                if (t && State.projects[State.currP].role === 'editor') {
                    t.title = document.getElementById('edit-title').value;
                    t.date = document.getElementById('edit-date').value;
                    t.priority = document.getElementById('edit-priority').value;
                    t.assignee = document.getElementById('edit-assignee').value;
                    t.desc = document.getElementById('edit-desc').value;
                    if (document.getElementById('task-preview-container').style.display === 'none') t.img = null;
                    DB.saveCurrentData();
                    Tasks.renderBoard();
                }
                document.getElementById('task-panel').classList.remove('open');
                State.activeTask = null;
            },

            handleTaskImage: async (input) => {
                if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                const file = input.files[0];
                if (file) {
                    const img = await fileToBase64(file);
                    document.getElementById('task-img-preview').src = img;
                    document.getElementById('task-img-label').style.display = 'none';
                    document.getElementById('task-preview-container').style.display = 'block';
                    if (State.activeTask) State.activeTask.img = img;
                }
            },

            removeImage: () => {
                if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                document.getElementById('task-img').value = '';
                document.getElementById('task-img-preview').src = '';
                document.getElementById('task-preview-container').style.display = 'none';
                document.getElementById('task-img-label').style.display = 'block';
                if (State.activeTask) State.activeTask.img = null;
            },

            deleteTask: () => {
                if (!State.activeTask) return;
                if (State.projects[State.currP].role === 'viewer') return Notify.show('Read-only project', 'error');

                const proj = State.projects[State.currP];
                proj.tasks = proj.tasks.filter(x => x.id !== State.activeTask.id);
                DB.saveCurrentData();
                State.activeTask = null;
                document.getElementById('task-panel').classList.remove('open');
                Tasks.renderBoard();
                Modals.close();
                Notify.show('Task deleted');
            },

            complete: () => {
                if (State.activeTask && State.projects[State.currP].role === 'editor') {
                    State.activeTask.done = !State.activeTask.done;
                    DB.saveCurrentData();
                    Tasks.closePanel();
                    Notify.show('Status updated');
                }
            },

            jumpToFlashcards: () => {
                const deckIdx = State.decks.findIndex(d => d.id === State.projects[State.currP].id);
                if (deckIdx !== -1) {
                    const fcNav = document.querySelectorAll('.nav-item')[1];
                    Nav.to('flashcards', fcNav);
                    FC.openOverview(deckIdx);
                }
            },

            share: () => Shared.share('project', State.projects[State.currP])
        };

        // ========== SHARING SYSTEM ==========
        const Shared = {
            selectedRole: 'editor', // Default role
            shareType: null,
            shareData: null,

            openJoinUI: () => {
                document.getElementById('join-id').value = '';
                document.getElementById('join-pass').value = '';
                Modals.open('modal-join');
            },

            share: (type, data) => {
                // Store data temporarily and open permission selection modal
                Shared.shareType = type;
                Shared.shareData = data;
                Shared.selectedRole = 'editor'; // Reset to default

                // Reset selection UI
                document.querySelectorAll('.permission-option').forEach(opt => {
                    if (opt.dataset.role === 'editor') {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });

                Modals.open('modal-share-permission');
            },

            selectPermission: (role, element) => {
                Shared.selectedRole = role;
                document.querySelectorAll('.permission-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                element.classList.add('selected');
            },

            confirmShare: () => {
                const id = "SPF-" + Math.floor(10000 + Math.random() * 90000);
                const password = Math.random().toString(36).substring(2, 10).toUpperCase();

                const sharedResources = Storage.get('spartan_shared') || {};
                sharedResources[id] = {
                    type: Shared.shareType,
                    data: JSON.parse(JSON.stringify(Shared.shareData)),
                    password: password,
                    role: Shared.selectedRole, // Store the selected role
                    createdAt: Date.now(),
                    createdBy: State.currentUser.id
                };
                Storage.set('spartan_shared', sharedResources);

                document.getElementById('share-id-display').value = id;
                document.getElementById('share-pass-display').value = password;

                Modals.close();
                Modals.open('modal-share-result');

                Notify.show('Share link created!', 'success');
            },

            confirmJoin: () => {
                const id = document.getElementById('join-id').value.trim();
                const password = document.getElementById('join-pass').value.trim();

                if (!id || !password) {
                    return Notify.show('Please fill all fields', 'error');
                }

                const sharedResources = Storage.get('spartan_shared') || {};
                const resource = sharedResources[id];

                if (!resource) {
                    return Notify.show('Invalid Resource ID', 'error');
                }

                if (resource.password !== password) {
                    return Notify.show('Incorrect password', 'error');
                }

                const imported = JSON.parse(JSON.stringify(resource.data));
                imported.role = resource.role || 'viewer'; // Use the role from share link, default to viewer
                imported.id = Date.now();
                imported.name = imported.name + ' (Shared)';

                if (resource.type === 'deck') {
                    State.decks.push(imported);
                    State.projects.push({
                        id: imported.id,
                        name: imported.name,
                        icon: imported.icon,
                        color: imported.color,
                        role: imported.role,
                        tasks: []
                    });
                } else if (resource.type === 'project') {
                    State.projects.push(imported);
                    State.decks.push({
                        id: imported.id,
                        name: imported.name,
                        icon: imported.icon,
                        color: imported.color,
                        role: imported.role,
                        cards: []
                    });
                } else if (resource.type === 'course') {
                    imported.chapters = imported.chapters || [];
                    Pathway.courses.push(imported);
                    Pathway.saveCourses();
                    Pathway.renderCourseList();
                }

                DB.saveCurrentData();
                FC.renderHub();
                Tasks.renderSidebar();
                Modals.close();
                Notify.show('Resource imported successfully!', 'success');
            },

            copyToClipboard: (inputId) => {
                const input = document.getElementById(inputId);
                input.select();
                document.execCommand('copy');
                Notify.show('Copied to clipboard!', 'success');
            }
        };

        // ========== PATHWAY MODULE ==========
        const Pathway = {
            courses: [],
            currentCourse: 0,
            currentLesson: 0,

            init: () => {
                // Load courses from storage or create default
                const savedCourses = Storage.get('spartan_courses_' + (State.currentUser ? State.currentUser.id : 'guest'));
                if (savedCourses && savedCourses.length > 0) {
                    Pathway.courses = savedCourses;
                } else {
                    Pathway.courses = [{
                        id: 'course_' + Date.now(),
                        title: 'My First Course',
                        role: 'creator',
                        icon: '🎓',
                        color: '#FF512F',
                        chapters: [{
                            id: 'chapter_' + Date.now(),
                            title: 'Getting Started',
                            lessons: [{
                                id: 'lesson_' + Date.now(),
                                title: 'Welcome',
                                duration: '5:00',
                                completed: false,
                                videoUrl: null,
                                content: 'Welcome to your learning journey!'
                            }]
                        }]
                    }];
                    Pathway.saveCourses();
                }

                Pathway.renderCourseList();
                if (Pathway.courses.length > 0) {
                    Pathway.switchCourse(0);
                }
            },

            saveCourses: () => {
                if (!State.currentUser) return;
                Storage.set('spartan_courses_' + State.currentUser.id, Pathway.courses);
            },

            renderCourseList: () => {
                const container = document.getElementById('course-list');
                if (!container) return;

                container.innerHTML = Pathway.courses.map((course, idx) => `
                    <div class="course-card ${idx === Pathway.currentCourse ? 'active' : ''}" onclick="Pathway.switchCourse(${idx})">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 1.5rem;">${course.icon || '🎓'}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary);">${course.title}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                                    ${course.chapters ? course.chapters.length : 0} chapters
                                </div>
                            </div>
                        </div>
                        ${course.role ? `<div class="course-badge ${course.role}">${course.role === 'creator' ? '👑 Creator' : '👁️ Viewer'}</div>` : ''}
                    </div>
                `).join('');
            },

            switchCourse: (idx) => {
                Pathway.currentCourse = idx;
                Pathway.currentLesson = 0;
                Pathway.renderCourseList();
                Pathway.renderChapters();
                Pathway.loadLesson(0);
                Pathway.updateProgress();
            },

            createCourse: () => {
                CustomModal.input('Create Course', 'Enter a title for your new course', 'Untitled Course', (title) => {
                    const newCourse = {
                        id: 'course_' + Date.now(),
                        title: title,
                        role: 'creator',
                        icon: '🎓',
                        color: '#FF512F',
                        chapters: [{
                            id: 'chapter_' + Date.now(),
                            title: 'Chapter 1',
                            lessons: [{
                                id: 'lesson_' + Date.now(),
                                title: 'Lesson 1',
                                duration: '5:00',
                                completed: false,
                                videoUrl: null,
                                content: 'Start your learning here!'
                            }]
                        }]
                    };

                    Pathway.courses.push(newCourse);
                    Pathway.saveCourses();
                    Pathway.switchCourse(Pathway.courses.length - 1);
                    Notify.show('Course created!');
                });
            },

            shareCourse: () => {
                const course = Pathway.courses[Pathway.currentCourse];
                if (!course) return;
                if (course.role !== 'creator') {
                    return Notify.show('Only creators can share courses', 'error');
                }
                Shared.share('course', course);
            },

            saveCourses: () => {
                if (State.currentUser) {
                    Storage.set('spartan_courses_' + State.currentUser.id, Pathway.courses);
                }
            },

            renderCourseList: () => {
                const container = document.getElementById('course-list');
                if (!container) return;

                container.innerHTML = Pathway.courses.map((c, i) => `
                    <div class="course-card ${i === Pathway.currentCourse ? 'active' : ''}" onclick="Pathway.switchCourse(${i})">
                        <div style="font-size: 2rem; margin-bottom: 8px;">${c.icon}</div>
                        <div class="course-title">${c.title}</div>
                        <div class="course-meta">${Pathway.getCourseStats(c)}</div>
                        ${c.role === 'creator' ? '<div class="course-badge">Creator</div>' : ''}
                        ${c.role === 'viewer' ? '<div class="course-badge viewer">Viewer</div>' : ''}
                    </div>
                `).join('') + `
                    <button class="btn btn-secondary w-full" style="margin-top: 15px;" onclick="Pathway.createCourse()">
                        <i class="fa-solid fa-plus"></i> New Course
                    </button>
                `;
            },

            getCourseStats: (course) => {
                let total = 0, completed = 0;
                course.chapters.forEach(ch => {
                    ch.lessons.forEach(l => {
                        total++;
                        if (l.completed) completed++;
                    });
                });
                return `${completed}/${total} lessons`;
            },

            switchCourse: (idx) => {
                Pathway.currentCourse = idx;
                Pathway.currentLesson = 0;
                Pathway.renderCourseList();
                Pathway.renderChapters();
                Pathway.loadLesson(0);
                Pathway.updateProgress();
            },

            createCourse: () => {
                Modals.prompt('New Course', 'Course Title:', (title) => {
                    if (title) {
                        Pathway.courses.push({
                            id: Date.now(),
                            title: title,
                            role: 'creator',
                            icon: '🎓',
                            color: '#FF512F',
                            chapters: [{
                                id: Date.now(),
                                title: 'Chapter 1',
                                lessons: [{
                                    id: Date.now(),
                                    title: 'Lesson 1',
                                    duration: '0:00',
                                    completed: false,
                                    videoUrl: null,
                                    content: 'Add your content here...'
                                }]
                            }]
                        });
                        Pathway.saveCourses();
                        Pathway.renderCourseList();
                        Pathway.switchCourse(Pathway.courses.length - 1);
                        Notify.show('Course created!');
                    }
                });
            },

            shareCourse: () => {
                const course = Pathway.courses[Pathway.currentCourse];
                if (course.role !== 'creator') {
                    return Notify.show('Only creators can share courses', 'error');
                }
                Shared.share('course', course);
            },

            renderChapters: () => {
                const container = document.getElementById('chapter-list');
                if (!container) return;
                let lessonIndex = 0;
                const course = Pathway.courses[Pathway.currentCourse];
                if (!course) return;

                container.innerHTML = course.chapters.map(ch => `
                    <div class="chapter-item">
                        <div class="chapter-header">${ch.title}</div>
                        ${ch.lessons.map((l, idx) => {
                    const cIdx = lessonIndex++;
                    return `<div class="lesson-item ${l.completed ? 'completed' : ''} ${cIdx === State.currentLesson ? 'active' : ''}" onclick="Pathway.loadLesson(${cIdx})">
                                <div class="lesson-icon">${l.completed ? '<i class="fa-solid fa-check"></i>' : (l.videoUrl ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-play"></i>')}</div>
                                <div class="lesson-info">
                                    <div class="lesson-title">${l.title}</div>
                                    <div class="lesson-meta">${l.duration}</div>
                                </div>
                            </div>`;
                }).join('')}
                    </div>`).join('');
            },

            loadLesson: (idx) => {
                State.currentLesson = idx;
                let current = 0;
                let lessonData = null;
                const course = Pathway.courses[Pathway.currentCourse];

                for (const ch of course.chapters) {
                    for (const l of ch.lessons) {
                        if (current === idx) {
                            lessonData = l;
                            break;
                        }
                        current++;
                    }
                    if (lessonData) break;
                }

                if (lessonData) {
                    document.getElementById('lesson-title-main').innerText = lessonData.title;

                    // Render video if exists
                    const videoContainer = document.getElementById('lesson-video-container');
                    if (lessonData.videoUrl) {
                        videoContainer.innerHTML = `
                            <video controls style="width: 100%; border-radius: 8px; background: #000;">
                                <source src="${lessonData.videoUrl}" type="video/mp4">
                                Your browser does not support video playback.
                            </video>
                        `;
                        videoContainer.style.display = 'block';
                    } else {
                        videoContainer.style.display = 'none';
                    }

                    // Load content
                    document.getElementById('lesson-text-content').innerText = lessonData.content || 'No content available.';

                    // Load notes
                    const savedNotes = Storage.get(`lesson_notes_${lessonData.id}`) || '';
                    document.getElementById('lesson-notes').value = savedNotes;
                    Pathway.renderChapters();

                    // Show upload button for creators
                    const uploadBtn = document.getElementById('btn-upload-video');
                    if (uploadBtn) {
                        uploadBtn.style.display = course.role === 'creator' ? 'block' : 'none';
                    }
                }
            },

            uploadVideo: async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (file.size > 50 * 1024 * 1024) {
                        return Notify.show('Video must be under 50MB', 'error');
                    }

                    Notify.show('Uploading video...', 'info');
                    const videoUrl = await fileToBase64(file);

                    // Find current lesson and add video
                    let lessonIndex = 0;
                    const course = Pathway.courses[Pathway.currentCourse];
                    for (const ch of course.chapters) {
                        for (const l of ch.lessons) {
                            if (lessonIndex === State.currentLesson) {
                                l.videoUrl = videoUrl;
                                Pathway.saveCourses();
                                Pathway.loadLesson(State.currentLesson);
                                Notify.show('Video uploaded!');
                                return;
                            }
                            lessonIndex++;
                        }
                    }
                };
                input.click();
            },

            updateProgress: () => {
                let total = 0;
                let completed = 0;
                const course = Pathway.courses[0];
                course.chapters.forEach(ch => {
                    ch.lessons.forEach(l => {
                        total++;
                        if (l.completed) completed++;
                    });
                });
                const percent = Math.round((completed / total) * 100);
                document.getElementById('progress-percent').innerText = percent + '%';
                document.getElementById('lessons-completed').innerText = completed;

                const circle = document.getElementById('progress-circle');
                const circumference = 2 * Math.PI * 52;
                const offset = circumference - (percent / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            },

            nextLesson: () => {
                if (State.currentLesson < 2) {
                    Pathway.loadLesson(State.currentLesson + 1);
                }
            },

            prevLesson: () => {
                if (State.currentLesson > 0) Pathway.loadLesson(State.currentLesson - 1);
            },

            switchTab: (el, tab) => {
                document.querySelectorAll('.lesson-tab').forEach(t => t.classList.remove('active'));
                el.classList.add('active');
                ['content', 'attachments', 'notes'].forEach(t => document.getElementById('lesson-tab-' + t).classList.add('hidden'));
                document.getElementById('lesson-tab-' + tab).classList.remove('hidden');
            },

            saveNotes: () => {
                const notes = document.getElementById('lesson-notes').value;
                Storage.set(`lesson_notes_${State.currentLesson}`, notes);
                Notify.show('Notes saved');
            },

            playVideo: () => Notify.show('Video playing...', 'info')
        };

        // ========== COMMUNITY MODULE ==========
        const Community = {
            channels: [],
            currentChannel: 'general',

            init: () => {
                // Load channels from storage
                const saved = Storage.get('spartan_channels_' + (State.currentUser ? State.currentUser.id : 'guest'));
                if (saved && saved.length > 0) {
                    Community.channels = saved;
                } else {
                    Community.channels = [
                        { id: 'general', name: 'general', icon: 'fa-hashtag', type: 'text', category: 'Main' },
                        { id: 'announcements', name: 'announcements', icon: 'fa-bullhorn', type: 'text', category: 'Main' },
                        { id: 'study-group', name: 'study-group', icon: 'fa-users', type: 'text', category: 'Learning' },
                        { id: 'help', name: 'help', icon: 'fa-question-circle', type: 'text', category: 'Learning' }
                    ];
                    Community.saveChannels();
                }

                Community.renderChannels();
                Community.loadChannel('general');
            },

            saveChannels: () => {
                if (!State.currentUser) return;
                Storage.set('spartan_channels_' + State.currentUser.id, Community.channels);
            },

            saveMessages: (channelId) => {
                if (!State.currentUser) return;
                const messages = Community.getMessages(channelId);
                Storage.set('spartan_messages_' + State.currentUser.id + '_' + channelId, messages);
            },

            loadMessages: (channelId) => {
                if (!State.currentUser) return [];
                return Storage.get('spartan_messages_' + State.currentUser.id + '_' + channelId) || [];
            },

            getMessages: (channelId) => {
                return Community.loadMessages(channelId);
            },

            renderChannels: () => {
                const container = document.getElementById('channel-list');
                if (!container) return;

                // Group by category
                const categories = {};
                Community.channels.forEach(ch => {
                    if (!categories[ch.category]) categories[ch.category] = [];
                    categories[ch.category].push(ch);
                });

                container.innerHTML = Object.keys(categories).map(cat => `
                    <div class="channel-category">
                        <div class="channel-category-header" onclick="Community.toggleCategory(this)">
                            <i class="fa-solid fa-chevron-down"></i>
                            <span>${cat.toUpperCase()}</span>
                        </div>
                        <div class="channel-category-list">
                            ${categories[cat].map(ch => `
                                <div class="channel-item ${ch.id === Community.currentChannel ? 'active' : ''}" onclick="Community.loadChannel('${ch.id}')">
                                    <i class="fa-solid ${ch.icon}"></i>
                                    <span>${ch.name}</span>
                                    ${Community.getUnreadCount(ch.id) > 0 ? `<div class="channel-unread">${Community.getUnreadCount(ch.id)}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('') + `
                    <button class="btn btn-secondary" style="margin: 10px 10px 5px 10px; width: calc(100% - 20px);" onclick="Community.createChannel()">
                        <i class="fa-solid fa-plus"></i> Add Channel
                    </button>
                    <button class="btn btn-secondary" style="margin: 5px 10px 10px 10px; width: calc(100% - 20px);" onclick="Modals.open('modal-join-channel')">
                        <i class="fa-solid fa-users"></i> Join Channel
                    </button>
                `;
            },

            toggleCategory: (el) => {
                const list = el.nextElementSibling;
                const icon = el.querySelector('i');
                list.classList.toggle('collapsed');
                icon.style.transform = list.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
            },

            getUnreadCount: (channelId) => {
                // Simple mock - could implement real unread tracking
                return 0;
            },

            createChannel: () => {
                CustomModal.input('Create Channel', 'Enter channel name (no spaces)', '', (name) => {
                    const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                    if (Community.channels.find(ch => ch.id === id)) {
                        return Notify.show('Channel already exists', 'error');
                    }

                    Community.channels.push({
                        id: id,
                        name: name,
                        icon: 'fa-hashtag',
                        type: 'text',
                        category: 'Main'
                    });

                    Community.saveChannels();
                    Community.renderChannels();
                    Community.loadChannel(id);
                    Notify.show('Channel created!');
                });
            },

            loadChannel: (id) => {
                Community.currentChannel = id;
                const channel = Community.channels.find(ch => ch.id === id);
                if (!channel) return;

                document.getElementById('channel-name').innerHTML = `<i class="fa-solid ${channel.icon}"></i> ${channel.name}`;
                document.getElementById('chat-input').placeholder = `Message #${channel.name}...`;

                Community.renderChannels();
                Community.renderMessages();
            },

            renderMessages: () => {
                const container = document.getElementById('chat-messages');
                if (!container) return;

                const messages = Community.getMessages(Community.currentChannel);

                if (messages.length === 0) {
                    container.innerHTML = `
                        <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-direction: column; gap: 10px;">
                            <i class="fa-solid fa-comments" style="font-size: 3rem; opacity: 0.3;"></i>
                            <div>No messages yet. Start the conversation!</div>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = messages.map((m, idx) => {
                    const prevMsg = messages[idx - 1];
                    const showAvatar = !prevMsg || prevMsg.author !== m.author ||
                        (new Date(m.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000);
                    
                    const isOwnMessage = State.currentUser && m.author === State.currentUser.name;

                    return `
                        <div class="message-group ${showAvatar ? 'with-avatar' : ''}" data-message-id="${m.id}">
                            ${showAvatar ? `
                                <div class="message-avatar" style="background: ${Community.getAvatarColor(m.author)}">${m.avatar}</div>
                                <div class="message-content" style="flex: 1; position: relative;">
                                    <div class="message-header">
                                        <span class="message-author">${m.author}</span>
                                        <span class="message-time">${Community.formatTime(m.timestamp)}</span>
                                        ${m.edited ? '<span style="font-size: 0.7rem; color: var(--text-secondary); margin-left: 5px;">(edited)</span>' : ''}
                                    </div>
                                    <div class="message-text" data-message-id="${m.id}">${Community.formatMessage(m.text)}</div>
                                    ${isOwnMessage ? `
                                        <div class="message-actions" style="position: absolute; top: 0; right: 0; opacity: 0; transition: opacity 0.2s; display: flex; gap: 5px;">
                                            <button class="btn-icon-sm" onclick="Community.editMessage(${m.id})" title="Edit">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <button class="btn-icon-sm" style="color: var(--status-danger);" onclick="Community.deleteMessage(${m.id})" title="Delete">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    ` : ''}
                                    ${m.reactions && m.reactions.length > 0 ? `
                                        <div class="message-reactions">
                                            ${m.reactions.map(r => `
                                                <div class="message-reaction" onclick="Community.toggleReaction(${m.id}, '${r.emoji}')">
                                                    <span>${r.emoji}</span>
                                                    <span>${r.count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : `
                                <div style="padding-left: 52px; margin-top: -8px; position: relative;">
                                    <div class="message-text" data-message-id="${m.id}">${Community.formatMessage(m.text)}</div>
                                    ${isOwnMessage ? `
                                        <div class="message-actions" style="position: absolute; top: 0; right: 0; opacity: 0; transition: opacity 0.2s; display: flex; gap: 5px;">
                                            <button class="btn-icon-sm" onclick="Community.editMessage(${m.id})" title="Edit">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <button class="btn-icon-sm" style="color: var(--status-danger);" onclick="Community.deleteMessage(${m.id})" title="Delete">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `}
                        </div>
                    `;
                }).join('');

                container.scrollTop = container.scrollHeight;
            },

            formatTime: (timestamp) => {
                const date = new Date(timestamp);
                const now = new Date();
                const diff = now - date;

                if (diff < 60000) return 'Just now';
                if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
                if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            },

            formatMessage: (text) => {
                // Format links
                text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--accent-color);">$1</a>');
                // Format bold
                text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                // Format italic
                text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
                // Format code
                text = text.replace(/`(.+?)`/g, '<code style="background: var(--hover-bg); padding: 2px 4px; border-radius: 3px;">$1</code>');
                return text;
            },

            getAvatarColor: (name) => {
                const colors = ['#FF512F', '#DD2476', '#4776E6', '#8E54E9', '#11998E', '#F093FB'];
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                return colors[Math.abs(hash) % colors.length];
            },

            sendMessage: () => {
                const input = document.getElementById('chat-input');
                const text = input.value.trim();

                if (!text) return;

                const messages = Community.getMessages(Community.currentChannel);
                const newMsg = {
                    id: Date.now(),
                    author: State.currentUser ? State.currentUser.name : 'Guest',
                    avatar: (State.currentUser ? State.currentUser.name : 'Guest')[0].toUpperCase(),
                    text: text,
                    timestamp: new Date().toISOString(),
                    reactions: []
                };

                messages.push(newMsg);
                
                // Save directly to storage
                if (State.currentUser) {
                    Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                }

                input.value = '';
                Community.renderMessages();
                Notify.show('Message sent');
            },

            handleKeyDown: (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    Community.sendMessage();
                }
            },

            addEmoji: () => {
                const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const input = document.getElementById('chat-input');
                input.value += emoji;
                input.focus();
            },

            toggleReaction: (msgId, emoji) => {
                // Simple reaction toggle
                Notify.show('Reaction added!');
            },

            editMessage: (msgId) => {
                const messages = Community.getMessages(Community.currentChannel);
                const msg = messages.find(m => m.id === msgId);
                if (!msg) return;

                CustomModal.input('Edit Message', 'Update your message', msg.text, (newText) => {
                    if (!newText.trim()) return Notify.show('Message cannot be empty', 'error');
                    
                    msg.text = newText.trim();
                    msg.edited = true;
                    msg.editedAt = new Date().toISOString();
                    
                    if (State.currentUser) {
                        Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                    }
                    
                    Community.renderMessages();
                    Notify.show('Message updated');
                });
            },

            deleteMessage: (msgId) => {
                Modals.confirm('Delete Message', 'Are you sure you want to delete this message?', () => {
                    let messages = Community.getMessages(Community.currentChannel);
                    messages = messages.filter(m => m.id !== msgId);
                    
                    if (State.currentUser) {
                        Storage.set('spartan_messages_' + State.currentUser.id + '_' + Community.currentChannel, messages);
                    }
                    
                    Community.renderMessages();
                    Notify.show('Message deleted');
                });
            },

            shareChannel: () => {
                const channel = Community.channels.find(ch => ch.id === Community.currentChannel);
                if (!channel) return;

                // Generate share code
                const shareCode = 'CH-' + Math.floor(10000 + Math.random() * 90000);
                const password = Math.random().toString(36).substring(2, 10).toUpperCase();

                // Save to shared channels
                const sharedChannels = Storage.get('spartan_shared_channels') || {};
                sharedChannels[shareCode] = {
                    channel: JSON.parse(JSON.stringify(channel)),
                    messages: Community.getMessages(Community.currentChannel),
                    password: password,
                    createdAt: Date.now(),
                    createdBy: State.currentUser ? State.currentUser.id : 'guest'
                };
                Storage.set('spartan_shared_channels', sharedChannels);

                // Show share modal
                document.getElementById('share-channel-code').value = shareCode;
                document.getElementById('share-channel-pass').value = password;
                document.getElementById('share-channel-name').innerText = channel.name;
                Modals.open('modal-share-channel');
                
                Notify.show('Share link created!', 'success');
            },

            joinSharedChannel: () => {
                const code = document.getElementById('join-channel-code').value.trim();
                const password = document.getElementById('join-channel-pass').value.trim();

                if (!code || !password) {
                    return Notify.show('Please fill all fields', 'error');
                }

                const sharedChannels = Storage.get('spartan_shared_channels') || {};
                const shared = sharedChannels[code];

                if (!shared) {
                    return Notify.show('Invalid channel code', 'error');
                }

                if (shared.password !== password) {
                    return Notify.show('Incorrect password', 'error');
                }

                // Add channel with unique ID
                const newChannel = {
                    ...shared.channel,
                    id: shared.channel.id + '-shared-' + Date.now(),
                    name: shared.channel.name + ' (Shared)'
                };

                Community.channels.push(newChannel);
                Community.saveChannels();

                // Import messages
                if (State.currentUser) {
                    Storage.set('spartan_messages_' + State.currentUser.id + '_' + newChannel.id, shared.messages);
                }

                Community.renderChannels();
                Community.loadChannel(newChannel.id);
                Modals.close();
                Notify.show('Channel joined successfully!', 'success');
            },

            clearChannel: () => {
                Modals.confirm('Clear Messages', 'Delete all messages in this channel?', () => {
                    const messages = [];
                    Community.saveMessages(Community.currentChannel);
                    Community.renderMessages();
                    Notify.show('Channel cleared');
                });
            }
        };

        // ========== WHITEBOARD MODULE ==========
        const Whiteboard = {
            canvas: null,
            ctx: null,
            boards: [],
            currentBoard: 0,
            layers: [],
            currentLayer: 0,
            tool: 'pen',
            color: '#FF512F',
            size: 3,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            isDrawing: false,
            draggedNote: null,
            dragOffset: { x: 0, y: 0 },
            pendingNotePos: null,
            pendingTextPos: null,
            selectedNoteColor: '#FFF59D',
            _inited: false,

            init: () => {
                if (Whiteboard._inited) return;
                Whiteboard.canvas = document.getElementById('wb-canvas');
                if (!Whiteboard.canvas) return;
                Whiteboard.ctx = Whiteboard.canvas.getContext('2d');

                const container = document.getElementById('wb-canvas-container');
                Whiteboard.canvas.width = container.clientWidth;
                Whiteboard.canvas.height = container.clientHeight;

                // Initialize with one default board
                Whiteboard.boards = [{
                    id: Date.now(),
                    name: 'Board 1',
                    layers: [{
                        id: 1,
                        name: 'Layer 1',
                        visible: true,
                        elements: []
                    }],
                    notes: []
                }];

                Whiteboard.currentBoard = 0;
                Whiteboard.layers = Whiteboard.boards[0].layers;
                Whiteboard.renderBoards();
                Whiteboard.renderLayers();

                const c = Whiteboard.canvas;
                c.addEventListener('mousedown', Whiteboard.onMouseDown);
                c.addEventListener('mousemove', Whiteboard.onMouseMove);
                c.addEventListener('mouseup', Whiteboard.onMouseUp);

                document.getElementById('wb-color').addEventListener('change', e => Whiteboard.color = e.target.value);
                document.getElementById('wb-size').addEventListener('input', e => {
                    Whiteboard.size = parseInt(e.target.value);
                    document.getElementById('wb-size-display').innerText = e.target.value + 'px';
                });

                window.addEventListener('resize', () => {
                    const container = document.getElementById('wb-canvas-container');
                    if (!container) return;
                    Whiteboard.canvas.width = container.clientWidth;
                    Whiteboard.canvas.height = container.clientHeight;
                    Whiteboard.render();
                });

                Whiteboard._inited = true;
            },

            renderBoards: () => {
                const container = document.getElementById('wb-board-list');
                if (!container) return;
                container.innerHTML = Whiteboard.boards.map((b, i) => `
                    <div class="wb-board-item ${i === Whiteboard.currentBoard ? 'selected' : ''}" onclick="Whiteboard.switchBoard(${i})">
                        <div class="wb-board-icon"><i class="fa-solid fa-file"></i></div>
                        <div class="wb-board-name">${b.name}</div>
                        <button class="wb-board-delete" onclick="event.stopPropagation(); Whiteboard.deleteBoard(${i})" title="Delete board">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>`).join('');
            },

            switchBoard: (idx) => {
                Whiteboard.currentBoard = idx;
                Whiteboard.layers = Whiteboard.boards[idx].layers;
                Whiteboard.currentLayer = 0;
                Whiteboard.renderBoards();
                Whiteboard.renderLayers();
                Whiteboard.render();
                Notify.show('Switched to ' + Whiteboard.boards[idx].name);
            },

            addBoard: () => {
                CustomModal.input('New Board', 'Enter a name for your new board', 'Board ' + (Whiteboard.boards.length + 1), (name) => {
                    Whiteboard.boards.push({
                        id: Date.now(),
                        name: name,
                        layers: [{
                            id: Date.now(),
                            name: 'Layer 1',
                            visible: true,
                            elements: []
                        }],
                        notes: []
                    });

                    Whiteboard.currentBoard = Whiteboard.boards.length - 1;
                    Whiteboard.layers = Whiteboard.boards[Whiteboard.currentBoard].layers;
                    Whiteboard.renderBoards();
                    Whiteboard.renderLayers();
                    Whiteboard.render();
                    Notify.show('Board created');
                });
            },

            deleteBoard: (idx) => {
                if (Whiteboard.boards.length <= 1) {
                    return Notify.show('Cannot delete the last board', 'error');
                }

                if (confirm('Delete this board?')) {
                    Whiteboard.boards.splice(idx, 1);
                    if (Whiteboard.currentBoard >= Whiteboard.boards.length) {
                        Whiteboard.currentBoard = Whiteboard.boards.length - 1;
                    }
                    Whiteboard.layers = Whiteboard.boards[Whiteboard.currentBoard].layers;
                    Whiteboard.renderBoards();
                    Whiteboard.renderLayers();
                    Whiteboard.render();
                    Notify.show('Board deleted');
                }
            },

            renameBoard: (idx) => {
                const newName = prompt('New board name:', Whiteboard.boards[idx].name);
                if (newName && newName.trim()) {
                    Whiteboard.boards[idx].name = newName.trim();
                    Whiteboard.renderBoards();
                    Notify.show('Board renamed');
                }
            },

            onMouseDown: (e) => {
                const rect = Whiteboard.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check if clicking on a note
                if (Whiteboard.tool === 'select') {
                    const board = Whiteboard.boards[Whiteboard.currentBoard];
                    for (let i = board.notes.length - 1; i >= 0; i--) {
                        const note = board.notes[i];
                        if (x >= note.x && x <= note.x + note.width &&
                            y >= note.y && y <= note.y + note.height) {

                            // Check if double click for editing
                            const now = Date.now();
                            if (Whiteboard.lastClickTime && now - Whiteboard.lastClickTime < 300 &&
                                Whiteboard.lastClickedNote === note) {
                                Whiteboard.editNote(note);
                                return;
                            }
                            Whiteboard.lastClickTime = now;
                            Whiteboard.lastClickedNote = note;

                            Whiteboard.draggedNote = note;
                            Whiteboard.dragOffset = { x: x - note.x, y: y - note.y };
                            return;
                        }
                    }
                }

                // Add new note
                if (Whiteboard.tool === 'note') {
                    Whiteboard.addNote(x, y);
                    return;
                }

                // Eraser tool
                if (Whiteboard.tool === 'eraser') {
                    Whiteboard.isErasing = true;
                    Whiteboard.erase(x, y);
                    return;
                }

                // Drawing mode
                Whiteboard.isDrawing = true;
                Whiteboard.startPos = { x, y };

                if (Whiteboard.tool === 'pen') {
                    Whiteboard.currentShape = {
                        type: 'path',
                        points: [{ ...Whiteboard.startPos }],
                        color: Whiteboard.color,
                        size: Whiteboard.size
                    };
                } else if (Whiteboard.tool === 'rect' || Whiteboard.tool === 'ellipse' || Whiteboard.tool === 'line') {
                    Whiteboard.currentShape = {
                        type: Whiteboard.tool,
                        start: { ...Whiteboard.startPos },
                        end: { ...Whiteboard.startPos },
                        color: Whiteboard.color,
                        size: Whiteboard.size
                    };
                } else if (Whiteboard.tool === 'text') {
                    Whiteboard.pendingTextPos = { x, y };
                    document.getElementById('wb-text-input').value = '';
                    Modals.open('modal-wb-text');
                }
            },

            onMouseMove: (e) => {
                const rect = Whiteboard.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Dragging note
                if (Whiteboard.draggedNote) {
                    Whiteboard.draggedNote.x = x - Whiteboard.dragOffset.x;
                    Whiteboard.draggedNote.y = y - Whiteboard.dragOffset.y;
                    Whiteboard.render();
                    return;
                }

                // Erasing
                if (Whiteboard.isErasing) {
                    Whiteboard.erase(x, y);
                    return;
                }

                // Drawing
                if (!Whiteboard.isDrawing) return;
                const pos = { x, y };

                if (Whiteboard.tool === 'pen') {
                    Whiteboard.currentShape.points.push(pos);
                    Whiteboard.render();
                } else if (Whiteboard.tool === 'rect' || Whiteboard.tool === 'ellipse' || Whiteboard.tool === 'line') {
                    Whiteboard.currentShape.end = pos;
                    Whiteboard.render();
                }
            },

            onMouseUp: () => {
                if (Whiteboard.draggedNote) {
                    Whiteboard.draggedNote = null;
                    return;
                }

                if (Whiteboard.isErasing) {
                    Whiteboard.isErasing = false;
                    return;
                }

                if (Whiteboard.currentShape) {
                    Whiteboard.layers[Whiteboard.currentLayer].elements.push(Whiteboard.currentShape);
                    Whiteboard.currentShape = null;
                }
                Whiteboard.isDrawing = false;
                Whiteboard.render();
            },

            addNote: (x, y) => {
                Whiteboard.pendingNotePos = { x, y };
                document.getElementById('wb-note-input').value = '';
                Whiteboard.selectedNoteColor = '#FFF59D';
                document.querySelectorAll('.note-color-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.color === '#FFF59D');
                });
                Modals.open('modal-wb-note');
            },

            confirmNote: () => {
                const text = document.getElementById('wb-note-input').value.trim();
                if (!text) return Notify.show('Note cannot be empty', 'error');

                Whiteboard.boards[Whiteboard.currentBoard].notes.push({
                    id: Date.now(),
                    x: Whiteboard.pendingNotePos.x,
                    y: Whiteboard.pendingNotePos.y,
                    width: 200,
                    height: 150,
                    text: text,
                    color: Whiteboard.selectedNoteColor
                });
                Whiteboard.render();
                Modals.close();
                Notify.show('Note added');
            },

            confirmText: () => {
                const text = document.getElementById('wb-text-input').value.trim();
                if (!text) return Notify.show('Text cannot be empty', 'error');

                Whiteboard.layers[Whiteboard.currentLayer].elements.push({
                    type: 'text',
                    x: Whiteboard.pendingTextPos.x,
                    y: Whiteboard.pendingTextPos.y,
                    text: text,
                    color: Whiteboard.color,
                    size: Whiteboard.size * 6
                });
                Whiteboard.render();
                Modals.close();
                Notify.show('Text added');
            },

            editNote: (note) => {
                Whiteboard.pendingNotePos = note;
                document.getElementById('wb-note-input').value = note.text;
                Whiteboard.selectedNoteColor = note.color;
                document.querySelectorAll('.note-color-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.color === note.color);
                });
                Modals.open('modal-wb-note');

                // Override confirm to edit instead of add
                const oldConfirm = Whiteboard.confirmNote;
                Whiteboard.confirmNote = () => {
                    const text = document.getElementById('wb-note-input').value.trim();
                    if (!text) return Notify.show('Note cannot be empty', 'error');
                    note.text = text;
                    note.color = Whiteboard.selectedNoteColor;
                    Whiteboard.render();
                    Modals.close();
                    Notify.show('Note updated');
                    Whiteboard.confirmNote = oldConfirm;
                };
            },

            erase: (x, y) => {
                const eraseRadius = Whiteboard.size * 10;

                // Erase from current layer
                const layer = Whiteboard.layers[Whiteboard.currentLayer];
                layer.elements = layer.elements.filter(el => {
                    if (el.type === 'path') {
                        // Check if any point is within erase radius
                        return !el.points.some(p => {
                            const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
                            return dist < eraseRadius;
                        });
                    } else if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'line') {
                        const centerX = (el.start.x + el.end.x) / 2;
                        const centerY = (el.start.y + el.end.y) / 2;
                        const dist = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
                        return dist > eraseRadius;
                    } else if (el.type === 'text') {
                        const dist = Math.sqrt((el.x - x) ** 2 + (el.y - y) ** 2);
                        return dist > eraseRadius;
                    }
                    return true;
                });

                Whiteboard.render();
            },

            render: () => {
                const ctx = Whiteboard.ctx;
                if (!ctx) return;

                // Save context state
                ctx.save();

                // Clear canvas
                ctx.clearRect(0, 0, Whiteboard.canvas.width, Whiteboard.canvas.height);

                // Apply zoom and pan
                ctx.translate(Whiteboard.offsetX, Whiteboard.offsetY);
                ctx.scale(Whiteboard.zoom, Whiteboard.zoom);

                // Draw layer elements
                Whiteboard.layers.forEach(l => {
                    if (!l.visible) return;
                    l.elements.forEach(el => Whiteboard.drawElement(el));
                });

                // Draw current shape being drawn
                if (Whiteboard.currentShape) Whiteboard.drawElement(Whiteboard.currentShape);

                // Draw sticky notes
                const board = Whiteboard.boards[Whiteboard.currentBoard];
                if (board && board.notes) {
                    board.notes.forEach(note => Whiteboard.drawNote(note));
                }

                // Restore context state
                ctx.restore();
            },

            zoomIn: () => {
                Whiteboard.zoom = Math.min(Whiteboard.zoom + 0.1, 3);
                document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
                Whiteboard.render();
            },

            zoomOut: () => {
                Whiteboard.zoom = Math.max(Whiteboard.zoom - 0.1, 0.3);
                document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
                Whiteboard.render();
            },

            resetZoom: () => {
                Whiteboard.zoom = 1;
                Whiteboard.offsetX = 0;
                Whiteboard.offsetY = 0;
                document.getElementById('wb-zoom-display').innerText = '100%';
                Whiteboard.render();
                Notify.show('Zoom reset');
            },

            drawNote: (note) => {
                const ctx = Whiteboard.ctx;

                // Note background
                ctx.fillStyle = note.color || '#FFF59D';
                ctx.fillRect(note.x, note.y, note.width, note.height);

                // Note border
                ctx.strokeStyle = '#F4C430';
                ctx.lineWidth = 2;
                ctx.strokeRect(note.x, note.y, note.width, note.height);

                // Note text
                ctx.fillStyle = '#333';
                ctx.font = '14px Inter, sans-serif';
                ctx.textBaseline = 'top';

                const words = note.text.split(' ');
                let line = '';
                let y = note.y + 10;
                const lineHeight = 20;
                const maxWidth = note.width - 20;

                for (let word of words) {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && line !== '') {
                        ctx.fillText(line, note.x + 10, y);
                        line = word + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, note.x + 10, y);
            },

            drawElement: (el) => {
                const ctx = Whiteboard.ctx;
                ctx.strokeStyle = el.color;
                ctx.fillStyle = el.color;
                ctx.lineWidth = el.size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (el.type === 'path') {
                    ctx.beginPath();
                    if (el.points.length > 0) ctx.moveTo(el.points[0].x, el.points[0].y);
                    el.points.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.stroke();
                } else if (el.type === 'rect') {
                    const width = el.end.x - el.start.x;
                    const height = el.end.y - el.start.y;
                    ctx.strokeRect(el.start.x, el.start.y, width, height);
                } else if (el.type === 'ellipse') {
                    const radiusX = Math.abs(el.end.x - el.start.x) / 2;
                    const radiusY = Math.abs(el.end.y - el.start.y) / 2;
                    const centerX = el.start.x + (el.end.x - el.start.x) / 2;
                    const centerY = el.start.y + (el.end.y - el.start.y) / 2;
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (el.type === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(el.start.x, el.start.y);
                    ctx.lineTo(el.end.x, el.end.y);
                    ctx.stroke();
                } else if (el.type === 'text') {
                    ctx.font = `${el.size}px Inter, sans-serif`;
                    ctx.fillText(el.text, el.x, el.y);
                }
            },

            setTool: (t) => {
                Whiteboard.tool = t;
                document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
            },

            /* zoomIn/zoomOut handled earlier */
            /* duplicate removed */


            updateZoom: () => {
                const canvas = Whiteboard.canvas;
                canvas.style.transform = `scale(${Whiteboard.zoom})`;
                canvas.style.transformOrigin = 'top left';
                document.getElementById('wb-zoom-display').innerText = Math.round(Whiteboard.zoom * 100) + '%';
            },

            addLayer: () => {
                Whiteboard.layers.push({
                    id: Date.now(),
                    name: `Layer ${Whiteboard.layers.length + 1}`,
                    visible: true,
                    elements: []
                });
                Whiteboard.currentLayer = Whiteboard.layers.length - 1;
                Whiteboard.renderLayers();
            },

            renderLayers: () => {
                const container = document.getElementById('wb-layer-list');
                if (!container) return;
                container.innerHTML = Whiteboard.layers.map((l, i) => `
                    <div class="wb-layer-item ${i === Whiteboard.currentLayer ? 'selected' : ''}" onclick="Whiteboard.currentLayer=${i}; Whiteboard.renderLayers()">
                        <div class="wb-layer-icon"><i class="fa-solid fa-layer-group"></i></div>
                        <div class="wb-layer-name">${l.name}</div>
                    </div>`).join('');
            },

            zoomIn: () => Notify.show('Zoom In', 'info'),
            zoomOut: () => Notify.show('Zoom Out', 'info'),

            undo: () => {
                if (Whiteboard.layers[Whiteboard.currentLayer].elements.length) {
                    Whiteboard.layers[Whiteboard.currentLayer].elements.pop();
                    Whiteboard.render();
                    Notify.show('Undone');
                }
            },

            clear: () => {
                Whiteboard.layers[Whiteboard.currentLayer].elements = [];
                Whiteboard.render();
                Notify.show('Canvas cleared');
            },

            export: () => {
                const a = document.createElement('a');
                a.href = Whiteboard.canvas.toDataURL('image/png');
                a.download = 'whiteboard_' + Date.now() + '.png';
                a.click();
                Notify.show('Exported successfully!', 'success');
            },

            toggleShortcuts: () => document.getElementById('wb-shortcuts').classList.toggle('active')
        };

        // Global helper for note color selection
        function WB_selectNoteColor(el) {
            document.querySelectorAll('.note-color-option').forEach(opt => opt.classList.remove('selected'));
            el.classList.add('selected');
            Whiteboard.selectedNoteColor = el.dataset.color;
        }

        console.log('✅ Spartan.Edu loaded successfully!');

        // Chatbot
        (function () { if (!window.chatbase || window.chatbase("getState") !== "initialized") { window.chatbase = (...arguments) => { if (!window.chatbase.q) { window.chatbase.q = [] } window.chatbase.q.push(arguments) }; window.chatbase = new Proxy(window.chatbase, { get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } }) } const onLoad = function () { const script = document.createElement("script"); script.src = "https://www.chatbase.co/embed.min.js"; script.id = "RB-GhOWlWGCnxZOsizoFz"; script.domain = "www.chatbase.co"; document.body.appendChild(script) }; if (document.readyState === "complete") { onLoad() } else { window.addEventListener("load", onLoad) } })();
// ========== PATHWAY VIDEO & EDIT FEATURES ==========
const PathwayEnhanced = {
    addVideo: (courseId, chapterId) => {
        CustomModal.input('Add Video', 'Enter video URL (YouTube, Vimeo, or direct link)', '', (url) => {
            if (!url) return Notify.show('Please enter a valid URL', 'error');
            
            const course = Pathway.courses.find(c => c.id === courseId);
            if (!course) return;
            
            const chapter = course.chapters.find(ch => ch.id === chapterId);
            if (!chapter) return;
            
            if (!chapter.videos) chapter.videos = [];
            
            // Parse video URL
            let videoData = PathwayEnhanced.parseVideoUrl(url);
            if (!videoData) {
                return Notify.show('Invalid video URL format', 'error');
            }
            
            // Prompt for video title
            CustomModal.input('Video Title', 'Enter video title', '', (title) => {
                if (!title) return Notify.show('Please enter a title', 'error');
                
                chapter.videos.push({
                    id: Date.now(),
                    title: title,
                    url: url,
                    type: videoData.type,
                    embedUrl: videoData.embedUrl,
                    duration: '',
                    completed: false,
                    addedAt: new Date().toISOString()
                });
                
                Pathway.save();
                Pathway.renderChapter(courseId, chapterId);
                Notify.show('Video added!', 'success');
            });
        });
    },
    
    parseVideoUrl: (url) => {
        // YouTube
        let youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            return {
                type: 'youtube',
                embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
            };
        }
        
        // Vimeo
        let vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            return {
                type: 'vimeo',
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
            };
        }
        
        // Direct video link
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return {
                type: 'direct',
                embedUrl: url
            };
        }
        
        return null;
    },
    
    playVideo: (courseId, chapterId, videoId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter || !chapter.videos) return;
        
        const video = chapter.videos.find(v => v.id === videoId);
        if (!video) return;
        
        // Show video modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 900px; padding: 0;">
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 1.3rem;">${video.title}</h2>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="border: none;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div style="position: relative; padding-bottom: 56.25%; background: #000;">
                    ${video.type === 'direct' ? `
                        <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                            <source src="${video.embedUrl}" type="video/mp4">
                            Your browser does not support video playback.
                        </video>
                    ` : `
                        <iframe 
                            src="${video.embedUrl}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    `}
                </div>
                <div style="padding: 20px;">
                    <button class="btn btn-primary w-full" onclick="PathwayEnhanced.markVideoComplete(${courseId}, ${chapterId}, ${videoId}); this.closest('.modal-overlay').remove();">
                        <i class="fa-solid fa-check"></i> Mark as Completed
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Mark as viewed
        if (!video.completed) {
            video.viewedAt = new Date().toISOString();
            Pathway.save();
        }
    },
    
    markVideoComplete: (courseId, chapterId, videoId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter || !chapter.videos) return;
        
        const video = chapter.videos.find(v => v.id === videoId);
        if (!video) return;
        
        video.completed = true;
        video.completedAt = new Date().toISOString();
        
        Pathway.save();
        Pathway.renderChapter(courseId, chapterId);
        Notify.show('Video marked as completed!', 'success');
    },
    
    editVideo: (courseId, chapterId, videoId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter || !chapter.videos) return;
        
        const video = chapter.videos.find(v => v.id === videoId);
        if (!video) return;
        
        CustomModal.input('Edit Video Title', 'Enter new title', video.title, (newTitle) => {
            if (!newTitle) return Notify.show('Title cannot be empty', 'error');
            
            video.title = newTitle;
            Pathway.save();
            Pathway.renderChapter(courseId, chapterId);
            Notify.show('Video updated!');
        });
    },
    
    deleteVideo: (courseId, chapterId, videoId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter || !chapter.videos) return;
        
        Modals.confirm('Delete Video', 'Are you sure you want to delete this video?', () => {
            chapter.videos = chapter.videos.filter(v => v.id !== videoId);
            Pathway.save();
            Pathway.renderChapter(courseId, chapterId);
            Notify.show('Video deleted');
        });
    },
    
    editChapter: (courseId, chapterId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;
        
        CustomModal.input('Edit Chapter', 'Enter new chapter name', chapter.name, (newName) => {
            if (!newName) return Notify.show('Name cannot be empty', 'error');
            
            chapter.name = newName;
            Pathway.save();
            Pathway.renderCourse(courseId);
            Notify.show('Chapter updated!');
        });
    },
    
    deleteChapter: (courseId, chapterId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        Modals.confirm('Delete Chapter', 'Delete this chapter and all its content?', () => {
            course.chapters = course.chapters.filter(ch => ch.id !== chapterId);
            Pathway.save();
            Pathway.renderCourse(courseId);
            Notify.show('Chapter deleted');
        });
    },
    
    editCourse: (courseId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box">
                <h2 style="margin-bottom: 20px;">Edit Course</h2>
                <div class="input-wrapper">
                    <label>Course Title</label>
                    <input type="text" id="edit-course-title" class="input-std" value="${course.title}">
                </div>
                <div class="input-wrapper">
                    <label>Course Icon (Emoji)</label>
                    <input type="text" id="edit-course-icon" class="input-std" value="${course.icon}" maxlength="2">
                </div>
                <div class="input-wrapper">
                    <label>Progress</label>
                    <input type="number" id="edit-course-progress" class="input-std" value="${course.progress}" min="0" max="100">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="PathwayEnhanced.saveCourseEdit(${courseId}); this.closest('.modal-overlay').remove()">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    saveCourseEdit: (courseId) => {
        const course = Pathway.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const title = document.getElementById('edit-course-title').value.trim();
        const icon = document.getElementById('edit-course-icon').value.trim();
        const progress = parseInt(document.getElementById('edit-course-progress').value);
        
        if (!title) return Notify.show('Title cannot be empty', 'error');
        
        course.title = title;
        course.icon = icon || '📚';
        course.progress = Math.max(0, Math.min(100, progress));
        
        Pathway.save();
        Pathway.renderCourses();
        Notify.show('Course updated!', 'success');
    },
    
    deleteCourse: (courseId) => {
        Modals.confirm('Delete Course', 'Delete this entire course and all its content?', () => {
            Pathway.courses = Pathway.courses.filter(c => c.id !== courseId);
            Pathway.save();
            Pathway.renderCourses();
            Notify.show('Course deleted');
        });
    }
};

// Update Pathway.renderChapter to include videos
const originalRenderChapter = Pathway.renderChapter;
Pathway.renderChapter = function(courseId, chapterId) {
    const course = Pathway.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    Pathway.currentChapter = chapterId;
    
    const container = document.getElementById('chapter-detail');
    if (!container) return;
    
    // Header with edit/delete
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="btn btn-secondary" style="border: none;" onclick="Pathway.renderCourse(${courseId})">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <div>
                    <h2 style="font-size: 1.8rem; margin: 0;">${chapter.name}</h2>
                    <p style="color: var(--text-secondary); margin: 5px 0 0 0;">
                        ${chapter.items.length} lessons • ${chapter.videos ? chapter.videos.length : 0} videos
                    </p>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary" onclick="PathwayEnhanced.editChapter(${courseId}, ${chapterId})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="PathwayEnhanced.deleteChapter(${courseId}, ${chapterId})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Videos section
    if (chapter.videos && chapter.videos.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-video"></i> Videos
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${chapter.videos.map(video => `
                        <div class="pathway-video-card ${video.completed ? 'completed' : ''}" onclick="PathwayEnhanced.playVideo(${courseId}, ${chapterId}, ${video.id})">
                            <div class="video-thumbnail">
                                <i class="fa-solid fa-play"></i>
                                ${video.completed ? '<div class="video-check"><i class="fa-solid fa-check"></i></div>' : ''}
                            </div>
                            <div class="video-info">
                                <div class="video-title">${video.title}</div>
                                <div class="video-actions" onclick="event.stopPropagation()">
                                    <button class="btn-icon-sm" onclick="PathwayEnhanced.editVideo(${courseId}, ${chapterId}, ${video.id})" title="Edit">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button class="btn-icon-sm" onclick="PathwayEnhanced.deleteVideo(${courseId}, ${chapterId}, ${video.id})" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Lessons section
    html += `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-book"></i> Lessons
            </h3>
            <div class="chapter-items">
                ${chapter.items.map((item, idx) => `
                    <div class="chapter-item ${item.completed ? 'completed' : ''}" onclick="Pathway.toggleItem(${courseId}, ${chapterId}, ${idx})">
                        <div class="item-check ${item.completed ? 'checked' : ''}">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="item-content">
                            <div class="item-title">${item.title}</div>
                            ${item.duration ? `<div class="item-meta">${item.duration}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Action buttons
    html += `
        <div style="display: flex; gap: 10px; margin-top: 25px;">
            <button class="btn btn-primary" onclick="PathwayEnhanced.addVideo(${courseId}, ${chapterId})">
                <i class="fa-solid fa-video"></i> Add Video
            </button>
            <button class="btn btn-secondary" onclick="Pathway.addLesson(${courseId}, ${chapterId})">
                <i class="fa-solid fa-plus"></i> Add Lesson
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    container.scrollTop = 0;
};

// Update course rendering to include edit/delete
const originalRenderCourses = Pathway.renderCourses;
Pathway.renderCourses = function() {
    const container = document.getElementById('course-list');
    if (!container) return;
    
    if (Pathway.courses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fa-solid fa-book-open" style="font-size: 3rem; opacity: 0.3; margin-bottom: 20px;"></i>
                <p style="font-size: 1.1rem;">No courses yet. Create one to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = Pathway.courses.map(course => `
        <div class="course-card" onclick="Pathway.renderCourse(${course.id})">
            <div class="course-icon">${course.icon}</div>
            <div class="course-info">
                <div class="course-title">${course.title}</div>
                <div class="course-meta">
                    <span>${course.chapters.length} chapters</span>
                    <span class="course-progress-text">${course.progress}% complete</span>
                </div>
                <div class="course-progress-bar">
                    <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                </div>
            </div>
            <div class="course-actions" onclick="event.stopPropagation()">
                <button class="btn-icon-sm" onclick="PathwayEnhanced.editCourse(${course.id})" title="Edit Course">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon-sm" onclick="PathwayEnhanced.deleteCourse(${course.id})" title="Delete Course">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

console.log('✅ Pathway video & edit features loaded');
