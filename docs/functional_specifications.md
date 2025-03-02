<br />
<div align="center">
  <h1 align="center">Functional Specifications</h1>
  <p align="center">
    <strong>Doodle Accessibility Enhancements for Screen Readers</strong>
    <br />
  
  </p>
</div>

<details>
<summary><b> 📖 Table Of Contents</b></summary>




1. [Introduction](#1-introduction)
2. [Scope](#2-scope)
3. [User Requirements](#3-user-requirements)
   - [Primary Users](#31-primary-users)
4. [Functional Requirements](#4-functional-requirements)
   - [Navigation Improvements](#41-navigation-improvements)
   - [Checkbox and Form Selection Enhancements](#42-checkbox-and-form-selection-enhancements)
   - [Improved Screen Reader Feedback](#43-improved-screen-reader-feedback)
   - [Mobile Accessibility Enhancements](#44-mobile-accessibility-enhancements)
   - [Voice Input for Future Expansion](#45-voice-input-for-future-expansion)
5. [Target Audience](#5-target-audience)
   - [Persona 1 - Emma (Blind User)](#51-persona-1---emma-blind-user)
   - [Persona 2 - Alex (Mobile User)](#52-persona-2---alex-mobile-user)
   - [Persona 3 - David (Hands-Free User)](#53-persona-3---david-hands-free-user)
6. [Additional Considerations](#6-additional-considerations)
7. [Implementation Constraints](#7-implementation-constraints)
8. [Defining Success](#8-defining-success)

</details>

## 1. Introduction

Doodle's current interface presents significant challenges for users relying on screen readers, particularly VoiceOver and NVDA. This document defines the functional requirements for improving accessibility, ensuring a smoother experience without modifying Doodle's core source code.

## 2. Scope

The project focuses on making Doodle's group surveys more accessible by addressing navigation, labeling, feedback, and input methods. The implementation will use browser-side enhancements like scripts or extensions.

## 3. User Requirements

### 3.1. Primary Users

- Blind or visually impaired users using screen readers.

- Users who rely on keyboard navigation instead of a mouse.

- Mobile users who use VoiceOver (iOS) or TalkBack (Android).


## 4. Functional Requirements

### 4.1. Navigation Improvements

FR-1: Logical Focus Order

The system shall ensure a predictable focus order when using Tab and arrow keys.

Users shall not experience random jumps between elements.

FR-2: Keyboard-Only Interaction

Users must be able to select time slots and submit responses without requiring a mouse.

### 4.2. Checkbox and Form Selection Enhancements

FR-3: ARIA Labels for Checkboxes

Each checkbox must have an aria-label specifying the corresponding date and time.

Example: aria-label="Select Monday 3 PM".

FR-4: Live Feedback on Selection Changes

When a user selects or deselects a checkbox, a verbal announcement shall confirm the action.

Implemented using aria-live="polite".

### 4.3. Improved Screen Reader Feedback

FR-5: Descriptive Labels for Interactive Elements

Buttons, pop-ups, and key interactive components must have meaningful descriptions.

FR-6: Speech Synthesis for Confirmation Messages

When a selection is made, a synthesized voice should confirm the action.

Example: "Monday at 3 PM selected."

### 4.4. Mobile Accessibility Enhancements

FR-7: VoiceOver & TalkBack Optimization

Time slots must be properly announced when navigating via VoiceOver or TalkBack.

FR-8: Touch Navigation Improvements

Ensure touch-based interactions trigger proper screen reader responses.

### 4.5. Voice Input for Future Expansion

FR-9: Voice Command Selection 

Users shall be able to say "Select Monday at 3 PM" to check a time slot.

Implemented via Web Speech API.

FR-10: Voice-Controlled Submission 

Users shall be able to submit their choices with a voice command.

## 5. Target Audience

### 5.1. Persona 1 - Emma (Blind User)

![Emma](img/persona1.png)

### 5.2. Persona 2 - Alex (Mobile User)

![Alex](img/persona2.png)

### 5.3. Persona 3 - David (Hands-Free User)

![David](img/persona3.png)

## 6. Additional Considerations

The solution must be lightweight and compatible with modern browsers, ensuring that it does not interfere with Doodle’s core functionality. The deployment process should be simple and achievable through a browser extension or script.

## 7. Implementation Constraints

Since there is no access to Doodle’s backend or source code, all enhancements must be applied dynamically using browser-side scripting. Compatibility with major screen readers, such as NVDA, JAWS, and VoiceOver, is essential.

## 8. Defining Success

Success will be measured by how easily users can navigate Doodle with a keyboard or screen reader. Time slots should be clearly labeled, selections should be confirmed audibly, and the interface should provide instant feedback. Ultimately, screen reader users should be able to complete surveys efficiently and independently without unnecessary frustration.




