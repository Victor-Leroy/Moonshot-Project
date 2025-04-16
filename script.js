// ==UserScript==
// @name         Doodle Group Meeting Accessibility Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Enhances accessibility for Doodle's group meeting organizer page with ARIA labels, keyboard navigation, and interactive voice commands.
// @author       Victor LEROY
// @match        *://doodle.com/meeting/organize/groups*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addAriaLabels() {
        document.querySelectorAll('[data-testid="option-checkbox"]').forEach((checkbox, index) => {
            let label = checkbox.closest('div').querySelector('span');
            if (label) {
                let timeSlotText = label.textContent.trim();
                checkbox.setAttribute('aria-label', `Select ${timeSlotText}`);
            } else {
                checkbox.setAttribute('aria-label', `Option ${index + 1}`);
            }
        });
    }

    function addLiveFeedback() {
        let liveRegion = document.createElement('div');
        liveRegion.setAttribute('id', 'doodle-live-feedback');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-9999px';
        document.body.appendChild(liveRegion);

        document.querySelectorAll('[data-testid="option-checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                let status = checkbox.checked ? 'selected' : 'deselected';
                document.getElementById('doodle-live-feedback').textContent = `Time slot ${status}`;
            });
        });
    }

    function improveKeyboardNavigation() {
        document.querySelectorAll('[data-testid="option-checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    checkbox.click();
                }
            });
        });
    }

    function enableVoiceCommands() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            let command = event.results[0][0].transcript.toLowerCase();
            console.log('Voice command detected:', command);

            if (command.includes('select all')) {
                document.querySelectorAll('[data-testid="option-checkbox"]').forEach(checkbox => {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                });
                speakText('All time slots selected.');
            } else if (command.includes('unselect all') || command.includes('deselect all')) {
                document.querySelectorAll('[data-testid="option-checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                });
                speakText('All time slots unselected.');
            } else if (command.includes('name')) {
                askForFullName();
            } else if (command.includes('email')) {
                checkAndConfirmEmail();
            } else {
                selectSpecificTimeSlot(command);
            }
        };

        document.addEventListener('keydown', (event) => {
            if (event.key === 'V') {
                recognition.start();
                console.log('Voice recognition started');
            }
        });
    }

    function selectSpecificTimeSlot(command) {
        document.querySelectorAll('[data-testid="option-checkbox"]').forEach(checkbox => {
            let label = checkbox.closest('div').querySelector('span');
            if (label && label.textContent.trim().toLowerCase().includes(command)) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
                speakText(`Selected time slot for ${label.textContent.trim()}`);
            }
        });
    }

    function askForFullName() {
        speakText('What is your first name?');
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            let firstName = event.results[0][0].transcript.replace(/what is your first name/i, '').trim();
            speakText('What is your last name?');

            const lastNameRecognition = new webkitSpeechRecognition();
            lastNameRecognition.continuous = false;
            lastNameRecognition.interimResults = false;
            lastNameRecognition.lang = 'en-US';

            lastNameRecognition.onresult = function(event) {
                let lastName = event.results[0][0].transcript.replace(/what is your last name/i, '').trim();
                let fullName = `${firstName} ${lastName}`;
                fillNameField(fullName);
            };
            lastNameRecognition.start();
        };
        recognition.start();

    }

    function fillNameField(name) {
        let nameInput = document.querySelector('input.Input-field');
        if (nameInput) {
            nameInput.value = name;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            speakText(`Name set to ${name}`);
        } else {
            speakText('Name field not found');
        }
    }

    function speakText(text) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }

    function checkAndConfirmEmail() {
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const email = emailInput.value;
        speakText(`Is your email address ${email}? Say yes or no.`);

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const response = event.results[0][0].transcript.toLowerCase();
            if (response.includes('yes')) {
                speakText('Email confirmed.');
            } else if (response.includes('no')) {
                speakText('Okay. Please fill your email address manually.');
                emailInput.focus();
            } else {
                speakText('I didn’t catch that. Please fill your email manually if needed.');
            }
        };
        recognition.start();
    }
}

function applyAccessibilityImprovements() {
        addAriaLabels();
        addLiveFeedback();
        improveKeyboardNavigation();
        enableVoiceCommands();
        checkAndConfirmEmail();
    }

    window.addEventListener('load', () => {
        setTimeout(applyAccessibilityImprovements, 3000); // Delay to ensure the page is loaded
    });
})();

