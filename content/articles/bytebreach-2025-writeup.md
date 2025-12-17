---
title: "ByteBreach 2025.2 Writeup"
date: "2025-12-17"
description: "Writeup of the ByteBreach 2025.2 cybersecurity challenge"
---

# ByteBreach 2025.2 Writeup

*A multi-stage CTF journey through cryptography, OSINT, infrastructure security, network forensics, and steganography — with a little help from AI and a lot of science fiction references.*

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

### The Actual Clue

The actual clue wasn't hidden in the HTML structure — it was hiding in plain sight within the multilingual text itself. Reading through the different language blocks, I found Portuguese text that mentioned:

- An S3 bucket on `eu-central`
- Bucket name: `cicadoidea6699`
- A file called "configuration.txt" but written in Macedonian Cyrillic: `конфигурација.txt`

**Notes:**
- **Cicadoidea** is the superfamily of cicadas — a nod to the famous [Cicada 3301](https://en.wikipedia.org/wiki/Cicada_3301) internet puzzle
- Using Macedonian Cyrillic for the filename filters out anyone brute-forcing common filenames
- Being from North Macedonia, I had a slight home-field advantage here 🇲🇰

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

The hint points to: **http://secondarysanity.codeonion.net/**

Visiting this page reveals another important message:

> "I just hope i cleaned everything from production in my latest terraform delete, including the terraform variables."

**Red flag:** "terraform variables" is a direct hint. Terraform variable files (`.tfvars`) often contain secrets and are frequently left exposed accidentally.

---

## Stage 8: Terraform Misconfiguration

**URL:** http://secondarysanity.codeonion.net/terraform.tfvars

Accessing the Terraform variables file directly reveals a classic infrastructure security mistake — exposed secrets in configuration files:

```hcl
Token 4: Requiem_for_Velocity

Next Token: https://drive.google.com/file/d/1AvhGVbvA-6KscvXMHhlgdek5CDcA9N9f/view?usp=drive_link
```

**🎯 Token 4: Requiem_for_Velocity**

**Real-world lesson:** Terraform files (`.tfvars`, `.tfstate`, `terraform.tfstate.backup`) are treasure troves for attackers. They often contain:
- Database passwords
- API keys
- Cloud provider credentials
- Infrastructure secrets

Always add `*.tfvars` and `*.tfstate*` to your `.gitignore` and never expose them on web servers.

---

## Stage 9: Email Forensics & OSINT

**File:** `interview.eml` (downloaded from Google Drive)

The EML file contained an email with two base64-encoded attachments:
1. A CV (curriculum vitae) PDF
2. `details.zip` (password-protected)

### The CV Analysis

The CV belonged to **Ivie Clayton**, an Engineering Manager from Manchester. Key details:

- **Current job:** Engineering Manager at Accenture
- **Previous:** Capgemini, IBM, Wipro
- **Education:** University of Toronto, graduated August 2014
- **Marathon:** Boston Marathon 2019, Bib #1421
- **Blog:** https://itsivie.blogspot.com

### The Blog OSINT

Ivie's blog contained several articles:
- **Password best practices** — ironically confessing her own bad habits
- Articles about her **cat named Pixelate**
- Her love of **running**
- Her fascination with **binary palindromes**

The password article contained this confession:

> "Years ago, I used 'Marley2014' as a password. Marley was my childhood dog. 2014 was when I graduated university."

### The Password Puzzle

This was the most challenging part — a classic OSINT misdirection:

- **Red herring:** The Marley2014 confession seemed like the obvious answer
- **Real password components:**
  - **Pixelate** — her current cat's name
  - **1421** — her marathon bib number (not a year!)
  
The connection: **1421 in binary = 10110001101**, which is a **binary palindrome** — linking to her stated interest!

**Password:** `Pixelate1421`

### The Zip File

Extracting `details.zip` with the password revealed:

```
Token 5: Relativistic_Records

Next Token: https://sites.google.com/view/yellowstone-transit-log/
```

**🎯 Token 5: Relativistic_Records**

**Note:** "Yellowstone" is the planet where Chasm City is located in the Revelation Space universe — continuing the Alastair Reynolds theme.

**Lesson learned:** OSINT password puzzles often combine multiple sources in non-obvious ways:
- Current pet names (not former ones mentioned as examples)
- Numbers that have special meaning beyond the obvious (bib number, not graduation year)
- Look for connections between seemingly unrelated interests (binary palindromes + marathon bib)

---

## Stage 10: Network Forensics

**URL:** https://sites.google.com/view/yellowstone-transit-log/

The page "Artifacts of Lost Protocol" contained:

> "The data archive remains intact, despite centuries of corruption and drift."
> "Patterns that once meant something to someone, somewhere, in a time now lost to relativistic lag. We were careful to keep the logs secure and we always used hex encoding."

The linked file was a **pcapng** (packet capture) file.

### Initial Analysis Challenges

Opening the file in Wireshark showed various protocols:
- TDS (SQL Server) traffic
- GIOP (CORBA) protocol
- Syslog packets
- Various TCP connections

Initial attempts to find patterns in:
- TCP payload data
- DNS queries
- HTTP objects

...all came up empty.

### The Breakthrough: Syslog Packets

The key was in the **Syslog packets**. The clue mentioned "hex encoding," and examining the syslog messages revealed hex-encoded data.

Using `tshark` to extract syslog data:

```bash
tshark -r data.pcapng -Y "syslog" -T fields -e syslog.msg
```

The extracted messages contained hex-encoded ASCII that, when decoded, revealed:

```
Token6:Testament_to_Darker_Hours;Next_Token:https://sites.google.com/view/hamadryad-onion/
```

**🎯 Token 6: Testament_to_Darker_Hours**

**Lesson learned:** Network forensics challenges often hide data in unexpected protocols. When the clue mentions a specific encoding (hex), look for that encoding in packet payloads, especially in text-based protocols like Syslog.

---

## Stage 11: Timing Attack

**URL:** https://sites.google.com/view/hamadryad-onion/

The page presents a scenario: an attacker trying to breach a legacy login endpoint, armed with:
- A list of usernames with login attempt response times
- A password list from an infostealer

The challenge: identify which user the stolen passwords belong to without brute-forcing all combinations.

### The Timing Side-Channel

Authentication systems can leak information through response times. When a username doesn't exist, the server can reject immediately. But for valid usernames, it must:
1. Look up the user
2. Hash the provided password  
3. Compare to the stored hash

This takes measurably longer.

### Finding the Outlier

Examining the response times from the pastebin:
- Most responses: 5-50 ms
- **One outlier: 380 ms** (7-10x longer!)

The user with the 380ms response time is the valid account — the one whose credentials were stolen.

### The Brute Force Script

With the target identified, I created a PowerShell script to test all ~100 stolen passwords against this single user:
```powershell
$url = "https://yieldcat.com/api/legacy-login"
$username = "mrobshaw@comcast.net"

foreach ($password in $passwords) {
    $body = @{ username = $username; password = $password } | ConvertTo-Json
    # POST with 10-second delay between attempts
    # Handle 429 rate limits with 60-second backoff
}
```

**Aside:** Claude initially refused to generate this script, interpreting it as credential stuffing. After clarifying that yieldcat.com is a legitimate security training platform (which Claude verified via web search), it assisted. A good reminder that AI guardrails sometimes need context.

### The Result

One of the passwords worked, revealing:
```
Token7:Paradox_Deferred;
Next Token:https://drive.google.com/file/d/1pba2FYbH5oxujuYE-AnQogkxBGt4uDYi/view?usp=sharing
```

**🎯 Token 7: Paradox_Deferred**

**Lesson learned:** Timing side-channels are real vulnerabilities. Authentication systems should use constant-time comparison functions to prevent username enumeration.

---

## Stage 12: Steganography

**File:** `difference.zip` (from Google Drive)

The zip contained two files:
- `n1.png` - appears to be random noise
- `n2.png` - also appears to be random noise

Two nearly identical noisy images is a classic steganography setup. The hidden message is likely encoded in the *differences* between the images.

Common techniques:
- XOR the two images together
- Subtract pixel values and look for patterns
- Compare LSB (Least Significant Bit) differences
- Look at specific color channels

### The Steganography Technique

The solution involved XORing the two images together:
```python
from PIL import Image
import numpy as np

img1 = Image.open('n1.png')
img2 = Image.open('n2.png')

arr1 = np.array(img1)
arr2 = np.array(img2)

xor_result = arr1 ^ arr2
```

The XOR values clustered in two ranges: 0-15 and 240-255 (0xF0-0xFF). This indicated data hidden in the **high nibble (upper 4 bits)**.

Further analysis revealed:
- **High nibble:** Binary values only (0x0 or 0xF)
- **Low nibble:** Random values 0-15 (noise/camouflage)

Extracting pixels where the high nibble differs:
```python
high_nibble_binary = ((xor_result >> 4) > 0).astype(np.uint8) * 255
Image.fromarray(high_nibble_binary).save('hidden.png')
```

The resulting image revealed text:

**🎯 Token 8: Doctrine_of_Receding_Light**

### Visual Cryptography

This is classic **visual cryptography** - neither image alone reveals anything meaningful (both appear as random noise), but combining them mathematically exposes the hidden message. The low nibble randomness serves as camouflage to make the images appear completely random.

---

## Challenge Complete! 🏆

All 8 tokens collected:

| # | Token | Challenge Type |
|---|-------|----------------|
| 1 | Calibrated_Absence | HTML metadata + OTP cryptography |
| 2 | Threshold_of_Antiquity | Multilingual OSINT + S3 bucket |
| 3 | Trajectory_Uncertain | JavaScript deobfuscation |
| 4 | Requiem_for_Velocity | Terraform misconfiguration |
| 5 | Relativistic_Records | Email forensics + OSINT password |
| 6 | Testament_to_Darker_Hours | Network forensics (pcapng/Syslog) |
| 7 | Paradox_Deferred | Timing attack + credential testing |
| 8 | Doctrine_of_Receding_Light | Visual cryptography/steganography |

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

## Working with Claude

I tackled this CTF with Claude as my AI partner throughout. Some observations:

**Where Claude excelled:**
- OTP decryption and cryptographic calculations
- Explaining steganography techniques and writing Python extraction scripts
- Network forensics analysis with tshark
- Research on real-world security incidents (the Shai-Hulud supply chain attack)

**Where Claude struggled:**
- Static JavaScript deobfuscation when runtime shuffling was involved (the browser debugger was the right tool)
- Initial refusal on the brute-force script (needed context that this was a legitimate CTF)
- Getting confused when decrypted output "didn't look right" (passwords aren't sentences!)

The takeaway: AI is a powerful CTF partner for analysis, scripting, and research — but knowing when to reach for browser DevTools or other specialized tools remains essential.

---

## Tools Used

- Browser developer tools (View Source, Inspect Element, Console, Debugger)
- Claude (for OTP decryption, research, JS deobfuscation attempts, pcapng analysis)
- Python with PIL/NumPy (for steganography extraction)
- Basic knowledge of AWS S3 URL structure
- Google Translate (for the Arabic red herring)
- A reading knowledge of Macedonian Cyrillic
- PowerShell scripts (for base64 decoding, credential testing)
- Wireshark / tshark (for pcapng network forensics)
- 7-Zip or similar (for password-protected zip extraction)
- Patience (for the OSINT password puzzle)

---

## Key Takeaways

1. **Always view source** — but don't just look for comments. Check alt text, title attributes, data attributes, everything.

2. **Red herrings are real** — Just because something has a `hidden` class doesn't mean it's *the* hidden thing. Sometimes it's bait.

3. **Decrypted passwords look like gibberish** — Don't second-guess a successful decryption because the output isn't readable English.

4. **Read the actual content** — In the wall of text challenge, the clue wasn't hidden in the HTML structure; it was in the text itself. Sometimes you have to actually read things.

5. **Use the debugger for runtime obfuscation** — LLMs can help with static analysis, but when arrays are shuffled at runtime, let the browser do the work. Inspect variables after execution.

6. **Cultural/language knowledge helps** — Macedonian Cyrillic, Dune references, Cicada 3301 lore, Alastair Reynolds, real-world security incidents... CTFs reward broad curiosity.

7. **Check multiple angles on GitHub** — Repos can hide secrets in commit history, branches, issues, actions, and more.

8. **Terraform files are security goldmines** — Always check for exposed `.tfvars` and `.tfstate` files. They frequently contain credentials.

9. **OSINT requires connecting disparate sources** — The password combined current cat name + marathon bib (not graduation year). Look for non-obvious connections.

10. **Network forensics: follow the encoding hint** — When a clue mentions "hex encoding," look for hex in packet payloads. Syslog and other text protocols are good hiding spots.

11. **Don't overthink red herrings** — The Marley2014 confession was a decoy. Sometimes the most "obvious" answer is intentional misdirection.

12. **Timing attacks reveal valid accounts** — Response time differences can leak whether a username exists. Look for statistical outliers.

13. **AI assistants need context** — Claude refused to help with credential testing until it understood the legitimate CTF context. Be prepared to explain your use case.

---

## Acknowledgments

Thanks to Bozidar Spirovski and [BeyondMachines](https://beyondmachines.net) for creating an excellent challenge that covered real-world security concepts while keeping things fun. The Alastair Reynolds theming was a delightful touch — I'll never look at lighthugger names the same way again.

If you enjoyed this writeup, check out the [BeyondMachines training platform](https://beyondmachines.net) for more security challenges.
