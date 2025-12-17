---
title: "ByteBreach 2025.2 Writeup"
date: "2025-12-17"
description: "Writeup of the ByteBreach 2025.2 cybersecurity challenge"
---

# ByteBreach 2025.2 Writeup

**Challenge:** ByteBreach 2025.2  
**Organizer:** BeyondMachines (Bozidar Spirovski)  
**Duration:** December 15, 2025 – January 2, 2026  
**URL:** https://challenge.beyondmachines.net/

## Overview

ByteBreach 2025.2 is a multi-stage cybersecurity challenge involving OSINT, cryptography, web security, and good old-fashioned detective work. The goal is to collect 8 tokens, each leading to the next challenge. The token names follow a distinctive pattern — more on that Easter egg at the end.

## Tokens Collected

| # | Token Name |
|---|------------|
| 1 | Calibrated_Absence |
| 2 | Threshold_of_Antiquity |
| 3 | Trajectory_Uncertain |
| 4 | Requiem_for_Velocity |
| 5 | Relativistic_Records |
| 6 | Testament_to_Darker_Hours |
| 7 | Paradox_Deferred |
| 8 | Doctrine_of_Receding_Light |

---

## Stage 1: The Starting Point

**URL:** https://challenge.beyondmachines.net/

The challenge page looks like a standard CTF landing page with rules, prizes, and timeline information. The first instinct in any web challenge: **view the page source**.

Scanning through the HTML, I found a clue hiding in an unexpected place — the `alt` attribute of the main challenge image:

```
I've added something in this site: https://cryptpad.fr/pad/#/2/pad/view/y77PNt4ibX8k97GA+8T4bqOFI49w7wbcehNS0DFn1Ag/p/embed/
You need a password. So here's a password, but it's also encrypted.
OMSHCHTOXDCHHTVGMN
Decrypt the password first. I've used a one-time pad. Because of course.
You need the first paragraph of a book about Ana by Tolstoy, translated by Constance Garnett. PDF.
```

**Lesson learned:** Don't just look for HTML comments or hidden divs. Alt text, title attributes, and other metadata are fair game.

---

## Stage 2: One-Time Pad Decryption

The clue specifies:
- Encryption method: One-Time Pad (OTP)
- Key source: First paragraph of Anna Karenina, Constance Garnett translation, PDF format
- Ciphertext: `OMSHCHTOXDCHHTVGMN`

The opening of Anna Karenina is one of the most famous in all of literature:

> "Happy families are all alike; every unhappy family is unhappy in its own way."

I used Claude to fetch the specific PDF from Project Gutenberg to ensure I had the exact Constance Garnett translation, then applied OTP decryption using the first paragraph as the key.

**Result:** `HMDSECTCPSUDPTECMC`

**Important gotcha:** When I first decrypted this, Claude got confused because the result doesn't look like readable English. But that's the point — it's a *password*, not a message. Passwords are supposed to look like gibberish. Don't second-guess a successful decryption just because the plaintext isn't a coherent sentence.

---

## Stage 3: The CryptPad Document

**URL:** https://cryptpad.fr/pad/#/2/pad/view/y77PNt4ibX8k97GA+8T4bqOFI49w7wbcehNS0DFn1Ag/p/embed/  
**Password:** `HMDSECTCPSUDPTECMC`

The password-protected CryptPad document contained:

```
Token 1: Calibrated_Absence

Next Token: http://walloftext.codeonion.net
```

**🎯 Token 1: Calibrated_Absence**

---

## Stage 4: The Wall of Text

**URL:** http://walloftext.codeonion.net

The URL name was apt — the page contained a babel of text in multiple languages. The natural first move: inspect the HTML for hidden elements.

### Red Herring

I quickly spotted a CSS class named `hidden` and found Arabic text:

> هل كنت تعتقد أن الأمر سيكون بهذه السهولة؟

Translation: *"Did you think it would be this easy?"*

Well played, Bozidar. Well played.

### The Real Clue

The actual clue wasn't hidden in the HTML structure — it was hiding in plain sight within the multilingual text itself. Reading through the different language blocks, I found Portuguese text that mentioned:

- An S3 bucket on `eu-central`
- Bucket name: `cicadoidea6699`
- A file called "configuration.txt" but written in Macedonian Cyrillic: `конфигурација.txt`

**Notes:**
- **Cicadoidea** is the superfamily of cicadas — a clear nod to the famous [Cicada 3301](https://en.wikipedia.org/wiki/Cicada_3301) internet puzzle
- Using Macedonian Cyrillic for the filename filters out anyone just brute-forcing common filenames

---

## Stage 5: The S3 Bucket

**URL:** `https://cicadoidea6699.s3.eu-central-1.amazonaws.com/конфигурација.txt`

Accessing the configuration file revealed:

```
Token 2: Threshold_of Antiquity

Next Token: http://shai-hulud.yieldcat.com
```

**🎯 Token 2: Threshold_of_Antiquity**

The next URL contains another science fiction reference: **Shai-Hulud** is the Fremen name for the giant sandworms in Frank Herbert's *Dune*.

---

## Stage 6: Shai-Hulud (The Supply Chain Attack)

**URL:** http://shai-hulud.yieldcat.com

This page describes a supply chain attack — and it's not fictional. The **Shai-Hulud worm** was a real, devastating npm supply chain attack that occurred in September and November 2025:

- First wave (September 2025): ~500 packages compromised, ~$50 million in cryptocurrency stolen
- Second wave (November 2025): 700+ additional packages, 25,000+ malicious GitHub repositories
- Victims included packages from Zapier, PostHog, Postman, and ENS Domains
- The malware exfiltrated credentials to public GitHub repos labeled "Sha1-Hulud: The Second Coming"

The page itself contained obfuscated JavaScript. Viewing source revealed:

```javascript
const _0x2d381a = _0x5a27;
function _0x5690() {
    const _0x5b7bc3 = [
        'load\x20local',
        'om:',
        'sYqne',
        'render.jss',
        // ... many more shuffled strings
    ];
    // ...
}
```

This is a common obfuscation pattern: strings are stored in an array that gets shuffled at runtime, making static analysis difficult.

### The Console Hint

Opening the browser console revealed an error message:

```
Failed to load local script from: http://shai-hulud.yieldcat.com/render.jss
Maybe you need the remote_url version?
```

This hints that there's a `remote_url` variable containing the real destination.

### Failed Approach: Static Deobfuscation

I tried using Claude to deobfuscate the JavaScript statically, but it produced an incorrect Google Drive URL. The problem: the array shuffling happens at runtime, and static analysis can't predict the final order.

### Successful Approach: Browser Debugger

Instead of fighting the obfuscation, I let the browser do the work:

1. Open Developer Tools (F12)
2. Go to the Console tab
3. After the page loads, type `remote_url` and press Enter
4. The browser returns the fully-constructed URL

**Result:** `https://drive.google.com/uc?export=download&id=1QPWq3fQbDXTTBfBcb3I2E2qMslm3WEFV`

### The Google Drive File

The link downloaded a file named `render.js` (note: `.js` not `.jss`) containing:

```html
<p><strong>Token 3: Trajectory_Uncertain</strong></p>
<p><strong>Next Token: https://github.com/BeyondMachines/secondary-case-for-sanity</strong></p>
```

**🎯 Token 3: Trajectory_Uncertain**

**Lesson learned:** When dealing with runtime obfuscation, don't waste time on static analysis. Use the debugger — let the JavaScript engine do the deobfuscation for you, then inspect the result.

---

## Stage 7: The GitHub Repository

**URL:** https://github.com/BeyondMachines/secondary-case-for-sanity

The repository contains a single README.md with a dismissive message:

> "This repo is going nowhere fast. We are abandoning it."
> "The latest code is published on codeonion subdomain. Whoever wants to be bothered, go there."

This hints at another `codeonion.net` subdomain. With GitHub repos, there are several places to investigate:

- Commit history
- Other branches
- Issues and Pull Requests
- Actions
- Forks

*[To be continued...]*

---

## Easter Egg: The Token Names

The eight token names follow a very distinctive naming pattern:

| Token | Style |
|-------|-------|
| Calibrated_Absence | [Abstract noun] + [Abstract noun] |
| Threshold_of_Antiquity | X of Y construction |
| Trajectory_Uncertain | Physics/motion reference |
| Requiem_for_Velocity | Melancholic + Physics reference |
| Relativistic_Records | Physics/spaceflight theme |
| Testament_to_Darker_Hours | Poetic, melancholic |
| Paradox_Deferred | Philosophical |
| Doctrine_of_Receding_Light | Cosmic, philosophical |

This is the signature naming convention of **lighthugger starships** from Alastair Reynolds' *Revelation Space* universe. Compare to canonical ship names like:

- *Nostalgia for Infinity*
- *Melancholia of Departure*
- *Silence Under Snow*
- *Accompaniment of Shadows*

Lighthuggers are massive interstellar spacecraft that travel at relativistic speeds (hence "light-huggers" — they hug close to the speed of light). The poetic, melancholic names reflect the existential weight of centuries-long journeys and the time dilation that separates crews from everyone they ever knew.

Bozidar Spirovski is clearly a fan. The token names aren't just identifiers — they're a love letter to hard science fiction.

---

## Tools Used

- Browser developer tools (View Source, Inspect Element, Console, Debugger)
- Claude (for OTP decryption, research, and attempted JS deobfuscation)
- Basic knowledge of AWS S3 URL structure
- Google Translate (for the Arabic red herring)
- A reading knowledge of Macedonian Cyrillic

---

## Key Takeaways

1. **Always view source** — but don't just look for comments. Check alt text, title attributes, data attributes, everything.

2. **Red herrings are real** — Just because something has a `hidden` class doesn't mean it's *the* hidden thing. Sometimes it's bait.

3. **Decrypted passwords look like gibberish** — Don't second-guess a successful decryption because the output isn't readable English.

4. **Read the actual content** — In the wall of text challenge, the clue wasn't hidden in the HTML structure; it was in the text itself. Sometimes you have to actually read things.

5. **Use the debugger for runtime obfuscation** — LLMs can help with static analysis, but when arrays are shuffled at runtime, let the browser do the work. Inspect variables after execution.

6. **Cultural/language knowledge helps** — Macedonian Cyrillic, Dune references, Cicada 3301 lore, Alastair Reynolds, real-world security incidents... CTFs reward broad curiosity.

7. **Check multiple angles on GitHub** — Repos can hide secrets in commit history, branches, issues, actions, and more.

---

*Writeup in progress. More stages to be documented as the challenge continues.*