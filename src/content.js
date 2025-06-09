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
 