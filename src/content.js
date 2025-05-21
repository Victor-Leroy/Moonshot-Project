(function() {
    let selectedLang = 'en-US';
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
                        };
                        locRec.start();
                    });
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
                    }
                };

                recognition.start();
            }
        });
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
