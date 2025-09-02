(function() {
    let selectedLang = 'fr-FR';
    let availableVoices = [];

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            availableVoices = window.speechSynthesis.getVoices();
        };
    } else {
        availableVoices = window.speechSynthesis.getVoices();
    }

    'use strict';

    function speakText(text, callback) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLang;

        const voices = speechSynthesis.getVoices();
        let selectedVoice;

        if (selectedLang === 'fr-FR') {
            const preferredFrenchVoices = ['Google français', 'Amelie', 'Daniel', 'Flo', 'Eddy', 'Grandma', 'Grandpa'];
            selectedVoice = preferredFrenchVoices.map(name => voices.find(v => v.name === name)).find(Boolean);
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang === 'fr-FR');
            }
        } else {
            selectedVoice = voices.find(v => v.lang === selectedLang);
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        if (callback) utterance.onend = callback;

        setTimeout(() => {
            try {
                speechSynthesis.speak(utterance);
            } catch (e) {
                console.error('[speakText] Error while speaking:', e);
                if (callback) callback();
            }
        }, 150);
    }

    function askUserDetails() {
        const nameInput = document.querySelector('input.Input-field');
        const emailInput = document.querySelector('input[type="email"]');
        const isLoggedIn = !nameInput && !emailInput;

        if (!isLoggedIn) {
            askForFullName(() => {
                checkAndConfirmEmail(() => {
                    askForPurpose();
                });
            });
        } else {
            askForPurpose();
        }
    }

    function askForFullName(callback) {
        const isFrench = selectedLang === 'fr-FR';
        const firstPrompt = isFrench ? "Quel est votre prénom ?" : "What is your first name?";
        const lastPrompt = isFrench ? "Quel est votre nom de famille ?" : "What is your last name?";

        speakText(firstPrompt, () => {
            const firstRec = new webkitSpeechRecognition();
            firstRec.lang = selectedLang;
            firstRec.onresult = function(event) {
                const firstName = event.results[0][0].transcript.trim();
                speakText(lastPrompt, () => {
                    const lastRec = new webkitSpeechRecognition();
                    lastRec.lang = selectedLang;
                    lastRec.onresult = function(event) {
                        const lastName = event.results[0][0].transcript.trim();
                        const fullName = `${firstName} ${lastName}`;
                        const input = document.querySelector('input.Input-field');
                        if (input) {
                            input.value = fullName;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        if (callback) callback();
                    };
                    lastRec.start();
                });
            };
            firstRec.start();
        });
    }

    function checkAndConfirmEmail(callback) {
        const emailInput = document.querySelector('input[type="email"]');
        const savedEmail = localStorage.getItem('savedEmail');

        if (emailInput) {
            const currentEmail = emailInput.value.trim();

            const promptEmail = () => {
                const prompt = selectedLang === 'fr-FR' ? "Quel est votre adresse e-mail ?" : "What is your email address?";
                speakText(prompt, () => {
                    const rec = new webkitSpeechRecognition();
                    rec.lang = selectedLang;
                    rec.onresult = function(event) {
                        const email = event.results[0][0].transcript.trim();
                        emailInput.value = email;
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        localStorage.setItem('savedEmail', email);
                        if (callback) callback();
                    };
                    rec.start();
                });
            };

            if (currentEmail) {
                speakText(
                    (selectedLang === 'fr-FR'
                        ? `Est-ce que votre adresse e-mail est ${currentEmail} ? Dites oui ou non.`
                        : `Is your email address ${currentEmail}? Say yes or no.`),
                    () => {
                        const recognition = new webkitSpeechRecognition();
                        recognition.lang = selectedLang;
                        recognition.onresult = function(event) {
                            const response = event.results[0][0].transcript.toLowerCase();
                            if (response.includes('yes') || response.includes('oui')) {
                                speakText(selectedLang === 'fr-FR' ? 'Parfait, on continue.' : 'Great, moving on.', callback);
                            } else {
                                promptEmail();
                            }
                        };
                        recognition.start();
                    }
                );
            } else {
                promptEmail();
            }
        } else if (callback) callback();
    }

    function askForPurpose() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench ? "Quel est l'objet du sondage de groupe ?" : "What is the group survey for?";
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
            rec.onresult = function(event) {
                const purpose = event.results[0][0].transcript.trim();
                const titleInput = Array.from(document.querySelectorAll('input.Input-field')).find(input => input.placeholder?.includes("ccasion") || input.placeholder?.includes("group"));
                if (titleInput) {
                    titleInput.value = purpose;
                    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                askForDescription();
            };
            rec.start();
        });
    }

    function askForDescription() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench ? "Souhaitez-vous ajouter une description ?" : "Would you like to add a description?";
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
            rec.onresult = function(event) {
                const response = event.results[0][0].transcript.toLowerCase();
                if (response.includes('yes') || response.includes('oui')) {
                    const askDesc = isFrench ? "Quelle est la description ?" : "What is the description?";
                    speakText(askDesc, () => {
                        const descRec = new webkitSpeechRecognition();
                        descRec.lang = selectedLang;
                        descRec.onresult = function(event) {
                            const desc = event.results[0][0].transcript.trim();
                            const descInput = document.querySelector('textarea');
                            if (descInput) {
                                descInput.value = desc;
                                descInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            askForLocation();
                        };
                        descRec.start();
                    });
                } else {
                    askForLocation();
                }
            };
            rec.start();
        });
    }

    function askForLocation() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench ? "Souhaitez-vous ajouter un lieu ?" : "Would you like to add a location?";
    
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
    
            rec.onresult = function(event) {
                const response = event.results[0][0].transcript.toLowerCase();
                if (response.includes('yes') || response.includes('oui')) {
                    const askLoc = isFrench ? "Quel est le lieu ?" : "What is the location?";
                    speakText(askLoc, () => {
                        const locRec = new webkitSpeechRecognition();
                        locRec.lang = selectedLang;
                        locRec.onresult = function(event) {
                            const location = event.results[0][0].transcript.trim();
                            const locInput = document.querySelector('input[placeholder*="passer"]');
                            if (locInput) {
                                locInput.value = location;
                                locInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            askForTimeSlots(); 
                        };
                        locRec.start();
                    });
                } else {
                    askForTimeSlots(); 
                }
            };
    
            rec.start();
        });
    }
    

    function enableVoiceCommands() {
        if (!('webkitSpeechRecognition' in window)) return;

        document.addEventListener('keydown', (event) => {
            if (event.key === 'V') {
                const recognition = new webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = selectedLang;

                recognition.onresult = function(event) {
                    let command = event.results[0][0].transcript.toLowerCase();
                    console.log('Voice command detected:', command);

                    if (command.includes('create a group survey') || command.includes('créer un sondage de groupe')) {
                        askUserDetails();
                    } else if (command.includes('switch to french')) {
                        selectedLang = 'fr-FR';
                        speakText('Langue changée en français.');
                    } else if (command.includes("passer à l'anglais")) {
                        selectedLang = 'en-US';
                        speakText('Language switched to English.');
                    } else if (command.includes('test time') || command.includes('tester l\'horaire')) {
                        speakText(selectedLang === 'fr-FR' ? 'Test de sélection des horaires.' : 'Testing time slot selection.');
                        askForDateTimeSlot();
                    }
                };

                recognition.start();
            }
        });
    }

    function askForTimeSlots() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench
            ? "Souhaitez-vous ajouter des horaires maintenant ?"
            : "Would you like to add your time slots now?";
    
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
    
            rec.onresult = function(event) {
                const response = event.results[0][0].transcript.toLowerCase();
                if (response.includes('yes') || response.includes('oui')) {
                    selectDuration();
                } else {
                    speakText(isFrench ? "Très bien, sondage prêt." : "Alright, your poll is ready.");
                }
            };
    
            rec.start();
        });
    }

    function selectDuration() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench
            ? "Quelle durée souhaitez-vous ? 60, 90, 120 minutes, ou toute la journée ?"
            : "What duration do you want? 60, 90, 120 minutes, or all day?";
    
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
    
            rec.onresult = function(event) {
                const result = event.results[0][0].transcript.toLowerCase();
    
                let matchText = '';
                if (result.includes('60') || result.includes('soixante')) matchText = '60';
                else if (result.includes('90') || result.includes('quatre-vingt-dix')) matchText = '90';
                else if (result.includes('120') || result.includes('cent vingt')) matchText = '120';
                else if (result.includes('day') || result.includes('journée')) matchText = 'Toute la journée';
    
                const durationButton = [...document.querySelectorAll('button')]
                    .find(btn => btn.textContent.includes(matchText));
    
                if (durationButton) durationButton.click();
    
                askForDateTimeSlot();
            };
    
            rec.start();
        });
    }

    function simulateSlotClick(dayIndex, hour) {
        const calendar = document.querySelector('.rbc-time-content');
        const dayColumns = calendar.querySelectorAll('.rbc-day-slot');
    
        if (!calendar || !dayColumns || !dayColumns[dayIndex]) {
            console.error("Calendar column not found for index", dayIndex);
            return;
        }
    
        const column = dayColumns[dayIndex];
    
        const slotHeight = column.offsetHeight / 24;
        const yOffset = hour * slotHeight;
    
        const x = column.getBoundingClientRect().left + 10;
        const y = column.getBoundingClientRect().top + yOffset;
    
        // PointerEvent instead of MouseEvent (more React-compatible)
        const clickEvent = new PointerEvent('pointerdown', {
            bubbles: true,
            clientX: x,
            clientY: y,
        });
    
        const target = document.elementFromPoint(x, y);
        if (target) {
            target.dispatchEvent(clickEvent);
    
            // Followed by click
            const clickEvent2 = new PointerEvent('click', {
                bubbles: true,
                clientX: x,
                clientY: y,
            });
            target.dispatchEvent(clickEvent2);
    
            console.log('Dispatched pointer+click to', target);
        } else {
            console.warn('No target at calculated point', x, y);
        }
    }
    

    function selectSlotByDayAndTime(dayShort, hourInt) {
        const dayMap = {
            lun: 'LUN.', mar: 'MAR.', mer: 'MER.', jeu: 'JEU.', ven: 'VEN.', sam: 'SAM.', dim: 'DIM.'
        };
    
        const expectedDayLabel = dayMap[dayShort.toLowerCase()];
        if (!expectedDayLabel) return console.warn("Invalid day:", dayShort);
    
        const dayHeaders = Array.from(document.querySelectorAll('[role="columnheader"]'));
        const dayIndex = dayHeaders.findIndex(el => el.textContent.trim().startsWith(expectedDayLabel));
        if (dayIndex === -1) return console.warn("Day header not found for:", expectedDayLabel);
    
        const rows = Array.from(document.querySelectorAll('[role="row"]'));
        for (const row of rows) {
            const timeLabel = row.querySelector('[role="rowheader"]');
            if (!timeLabel) continue;
    
            const labelText = timeLabel.textContent.trim();
            const rowHour = parseInt(labelText.split(':')[0]);
            if (rowHour !== hourInt) continue;
    
            const cells = row.querySelectorAll('[role="gridcell"]');
            const targetCell = cells[dayIndex];
            if (targetCell) {
                targetCell.click();
                console.log(`✅ Selected ${expectedDayLabel} at ${labelText}`);
            } else {
                console.warn("No cell found for that time and day.");
            }
            break;
        }
    }
    
    
    
    
    function askForDateTimeSlot() {
        const isFrench = selectedLang === 'fr-FR';
        const prompt = isFrench
            ? "Quel jour et quelle heure souhaitez-vous choisir ?"
            : "Which day and time would you like to pick?";
    
        speakText(prompt, () => {
            const rec = new webkitSpeechRecognition();
            rec.lang = selectedLang;
    
            rec.onresult = function(event) {
                const spokenText = event.results[0][0].transcript.toLowerCase();
                const { day, time, spokenDay } = parseDateCommand(spokenText);
    
                if (day && time) {
                    const readableTime = time?.replace(':00', 'h');
                    const hourNum = parseInt(time.replace(':00', ''));
    
                    const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
                    const dayIndex = dayNames.indexOf(day);
    
                    if (dayIndex === -1 || isNaN(hourNum)) {
                        speakText(isFrench ? "Jour ou heure non reconnu." : "Unrecognized day or time.");
                        return askForDateTimeSlot();
                    }
    
                    speakText(
                        isFrench
                            ? `Sélection de ${spokenDay} à ${readableTime}`
                            : `Selecting ${spokenDay} at ${readableTime}`
                    );
    
                    selectSlotByDayAndTime(day, parseInt(time.split(':')[0]));
    
                    const askMore = isFrench
                        ? "Souhaitez-vous ajouter un autre horaire ?"
                        : "Would you like to add another time slot?";
                    speakText(askMore, () => {
                        const moreRec = new webkitSpeechRecognition();
                        moreRec.lang = selectedLang;
                        moreRec.onresult = function(e) {
                            const resp = e.results[0][0].transcript.toLowerCase();
                            if (resp.includes('yes') || resp.includes('oui')) {
                                askForDateTimeSlot();
                            } else {
                                speakText(
                                    isFrench ? "Très bien, sondage terminé." : "Alright, done with scheduling."
                                );
                            }
                        };
                        moreRec.start();
                    });
                } else {
                    speakText(
                        isFrench
                            ? "Je n'ai pas compris. Veuillez répéter le jour et l'heure."
                            : "I didn't catch that. Please repeat the day and time."
                    );
                    askForDateTimeSlot();
                }
            };
    
            rec.start();
        });
    }
    
    

    function parseDateCommand(text) {
        const days = {
            'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
            'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun',
            'lundi': 'lun', 'mardi': 'mar', 'mercredi': 'mer',
            'jeudi': 'jeu', 'vendredi': 'ven', 'samedi': 'sam', 'dimanche': 'dim'
        };
    
        const frenchNumberMap = {
            'zéro': 0, 'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4,
            'cinq': 5, 'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
            'onze': 11, 'douze': 12, 'treize': 13, 'quatorze': 14,
            'quinze': 15, 'seize': 16, 'dix-sept': 17, 'dix huit': 18, 'dix-neuf': 19,
            'vingt': 20
        };
    
        const lowerText = text.toLowerCase();
        const dayKey = Object.keys(days).find(d => lowerText.includes(d));
        const day = dayKey ? days[dayKey] : null;
    
        let hour = null;
        let h = null;
        const digitMatch = lowerText.match(/(\d{1,2})(?:[:h]\d{2})?\s*(a\.m\.|p\.m\.|am|pm)?/);
    
        if (digitMatch) {
            h = parseInt(digitMatch[1]);
            const suffix = digitMatch[2];
            if (suffix && (suffix.includes('p') || suffix.includes('P')) && h < 12) h += 12;
        } else {
            const wordKey = Object.keys(frenchNumberMap).find(k => lowerText.includes(k));
            if (wordKey) {
                h = frenchNumberMap[wordKey];
            }
        }
    
        if (h !== null) {
            hour = h < 10 ? `0${h}:00` : `${h}:00`;
        }
    
        return { day, time: hour, spokenDay: dayKey };
    }

    /* ========= AVAILABILITY READER & SELECTOR ========= */

/* Utility: speak a queue of lines, one after another */
function speakQueue(lines, done) {
	const next = () => {
		if (!lines.length) return done && done();
		const line = lines.shift();
		speakText(line, next);
	};
	next();
}

/* Try to find a human-readable day for a node by walking up the column/card */
function findDayLabelFor(node) {
	// Common headings Doodle-like: contains short or long weekday + day number
	const DAY_PAT = /\b(LUN\.|MAR\.|MER\.|JEU\.|VEN\.|SAM\.|DIM\.|MON|TUE|WED|THU|FRI|SAT|SUN)\b|\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
	let cur = node;
	for (let i = 0; i < 6 && cur; i++) {
		// try column headers or title-like elements
		const headers = cur.querySelectorAll('h1,h2,h3,[role="columnheader"],[data-testid],.rbc-header');
		for (const h of headers) {
			const t = h.textContent.trim();
			if (DAY_PAT.test(t)) return t.replace(/\s+/g, ' ');
		}
		cur = cur.parentElement;
	}
	return ''; // fallback
}

/* Collect all time options visible on the page */
function getAvailabilitySlots() {
	const TIME_RANGE = /(\d{1,2}:\d{2}\s?(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s?(?:AM|PM)?)/i;
	// heuristic: any element that contains a time range is an option; include buttons in same block
	const candidates = Array.from(document.querySelectorAll('*, *:before, *:after')).filter(el => {
		if (!el || !el.textContent) return false;
		const txt = el.textContent;
		return TIME_RANGE.test(txt);
	});

	// dedupe by nearest block (avoid counting a time range multiple times)
	const blocks = [];
	const seen = new Set();
	for (const el of candidates) {
		let block = el.closest('[role="gridcell"], [role="row"], [data-testid], .card, .rbc-event, .availability, .option, .sc-card, .sc-row') || el;
		if (!block) block = el;
		if (seen.has(block)) continue;
		seen.add(block);

		const txt = block.textContent.replace(/\s+/g, ' ').trim();
		const m = txt.match(TIME_RANGE);
		if (!m) continue;

		const day = findDayLabelFor(block);
		// Find the “vote buttons” inside this block (✅/⚠/✖/⏳)
		const buttons = Array.from(block.querySelectorAll('button,[role="button"],[aria-pressed]'));

		blocks.push({
			node: block,
			dayLabel: day,
			timeLabel: `${m[1]} - ${m[2]}`,
			buttons
		});
	}

	// Give stable index
	return blocks.map((b, i) => ({ ...b, index: i + 1 }));
}

/* Read options aloud */
function readAvailabilities() {
	const slots = getAvailabilitySlots();
	if (!slots.length) {
		return speakText(selectedLang === 'fr-FR'
			? "Aucune disponibilité détectée à l'écran."
			: "I couldn't find any availabilities on the screen.");
	}

	const lines = slots.map(s => {
		const idx = `Option ${s.index}`;
		if (selectedLang === 'fr-FR') {
			return `${idx}. ${s.dayLabel ? s.dayLabel + ', ' : ''}${s.timeLabel}`;
		}
		return `${idx}. ${s.dayLabel ? s.dayLabel + ', ' : ''}${s.timeLabel}`;
	});

	const intro = selectedLang === 'fr-FR'
		? "Voici les disponibilités. Dites par exemple: Option 2 oui; ou samedi 6 à 13 heures si besoin."
		: "Here are the availabilities. Say, for example: Option 2 yes; or Saturday 6 at 1 PM if need be.";

	speakQueue([intro, ...lines], () => awaitSelection(slots));
}

/* Map localized response words to a status key */
function parseStatus(text) {
	const t = text.toLowerCase();

	// YES
	if (/(^|\s)(yes|oui|ok|d'accord|je peux)(\s|$)/.test(t)) return 'yes';

	// IF NEED BE
	if (/(if need be|si besoin|si nécessaire|au besoin)/.test(t)) return 'ifneed';

	// CANNOT ATTEND / NO
	if (/(cannot attend|can\'t|can’t|no|non|je ne peux pas|impossible)/.test(t)) return 'no';

	// PENDING / MAYBE
	if (/(pending|maybe|à confirmer|peut[- ]?être|incertain)/.test(t)) return 'pending';

	return null;
}

/* Try to identify an option either by "option N" or by (day + hour) */
function resolveOptionFromSpeech(slots, speech) {
	const t = speech.toLowerCase();

	// Option number
	const m = t.match(/option\s+(\d+)/i);
	if (m) {
		const idx = parseInt(m[1], 10);
		return slots.find(s => s.index === idx) || null;
	}

	// Day keywords (fr/en) + hour
	const { day, time } = parseDateCommand(t); // you already have this function
	if (!day && !time) return null;

	// Build tolerant checks
	const dayMap = { lun:'lun', mar:'mar', mer:'mer', jeu:'jeu', ven:'ven', sam:'sam', dim:'dim',
		mon:'mon', tue:'tue', wed:'wed', thu:'thu', fri:'fri', sat:'sat', sun:'sun' };

	const dayShort = day ? dayMap[day] || day : null;
	const hour = time ? parseInt(time.split(':')[0], 10) : null;

	// Score slots by matching day/hour presence in their labels
	let best = null, bestScore = -1;
	for (const s of slots) {
		let score = 0;
		const label = `${s.dayLabel} ${s.timeLabel}`.toLowerCase();

		if (dayShort && label.includes(dayShort)) score += 2;

		if (hour != null) {
			// naive hour match against either 24h or am/pm hour
			const h24 = hour.toString().padStart(2,'0');
			const h12 = ((hour % 12) || 12).toString();
			if (label.includes(`${h24}:`) || label.includes(`${h12}:`)) score += 2;
		}

		if (score > bestScore) { bestScore = score; best = s; }
	}
	return bestScore > 0 ? best : null;
}

/* Click the correct status button inside a slot */
function applySelection(slot, statusKey) {
	if (!slot) return false;
	const STATUS_PATTERNS = {
		yes: [/yes/i, /oui/i, /✅/, /\by\b/i],
		ifneed: [/(if need be|si besoin|si nécessaire|au besoin)/i, /⚠/, /🤞/],
		no: [/(cannot|can\'t|can’t|no|non|✖|x)/i],
		pending: [/(pending|maybe|à confirmer|peut[- ]?être|⏳)/i]
	};

	const pats = STATUS_PATTERNS[statusKey] || [];
	// Search buttons for a matching aria-label/title/text
	for (const btn of slot.buttons) {
		const label = (btn.ariaLabel || btn.getAttribute('aria-label') || btn.title || btn.textContent || '').trim();
		if (!label) continue;
		if (pats.some(re => re.test(label))) {
			btn.click();
			return true;
		}
	}
	// Fallback: try clickable squares within the same block
	const fallbackBtns = Array.from(slot.node.querySelectorAll('button,[role="button"]'));
	for (const btn of fallbackBtns) {
		const label = (btn.ariaLabel || btn.getAttribute('aria-label') || btn.title || btn.textContent || '').trim();
		if (pats.some(re => re.test(label))) { btn.click(); return true; }
	}
	return false;
}

/* Listen for one selection command and execute it */
function awaitSelection(slots) {
	const prompt = selectedLang === 'fr-FR'
		? "Dites votre choix, par exemple: Option 1 oui; ou samedi 6 à 13 heures si besoin."
		: "Say your choice, for example: Option 1 yes; or Saturday 6 at 1 PM if need be.";

	speakText(prompt, () => {
		const rec = new webkitSpeechRecognition();
		rec.lang = selectedLang;
		rec.onresult = (e) => {
			const speech = e.results[0][0].transcript.trim();
			const status = parseStatus(speech);
			const slot = resolveOptionFromSpeech(slots, speech);

			if (!slot || !status) {
				speakText(selectedLang === 'fr-FR'
					? "Je n'ai pas compris. Répétez: Option numéro et statut, par exemple: Option 2 oui."
					: "I didn't get that. Please repeat: option number and status, e.g., Option 2 yes.");
				return awaitSelection(slots);
			}

			const ok = applySelection(slot, status);
			if (ok) {
				const confirm = selectedLang === 'fr-FR'
					? `C'est noté pour l'option ${slot.index} : ${slot.timeLabel}.`
					: `Recorded for option ${slot.index}: ${slot.timeLabel}.`;
				speakText(confirm, () => {
					// Ask if user wants to select another
					const again = selectedLang === 'fr-FR'
						? "Voulez-vous en sélectionner une autre ?"
						: "Would you like to select another?";
					speakText(again, () => {
						const more = new webkitSpeechRecognition();
						more.lang = selectedLang;
						more.onresult = (ev) => {
							const ans = ev.results[0][0].transcript.toLowerCase();
							if (ans.includes('yes') || ans.includes('oui')) {
								return awaitSelection(slots);
							} else {
								speakText(selectedLang === 'fr-FR' ? "Terminé." : "All set.");
							}
						};
						more.start();
					});
				});
			} else {
				speakText(selectedLang === 'fr-FR'
					? "Je n'ai pas trouvé le bouton correspondant."
					: "I couldn't find the matching button.");
			}
		};
		rec.start();
	});
}

/* Hook it into your existing voice command hotkey (press V) */
(function extendVoiceCommands() {
	const originalEnable = enableVoiceCommands;
	window.enableVoiceCommands = function() {
		originalEnable();
		document.addEventListener('keydown', (event) => {
			if (event.key === 'V') {
				const recognition = new webkitSpeechRecognition();
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.lang = selectedLang;
				recognition.onresult = function(event) {
					const command = event.results[0][0].transcript.toLowerCase();
					if (command.includes('read availabilities') || command.includes('lire les disponibilités')) {
						readAvailabilities();
					}
				};
				recognition.start();
			}
		}, { capture: true });
	};
})();


    function addAriaLabels() {}
    function addLiveFeedback() {}
    function improveKeyboardNavigation() {}

    function applyAccessibilityImprovements() {
        addAriaLabels();
        addLiveFeedback();
        improveKeyboardNavigation();
        enableVoiceCommands();
    }

    window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
    };

    window.addEventListener('load', () => {
        setTimeout(applyAccessibilityImprovements, 3000);
    });
})();
 