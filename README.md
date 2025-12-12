# Proton Pass for Raycast

Search and manage your Proton Pass items directly from Raycast.

## Requirements

- [Raycast](https://raycast.com/)
- [Proton Pass CLI](https://proton.me/support/pass-cli) installed and authenticated

### Installing the CLI

1. Download from [proton.me/support/pass-cli](https://proton.me/support/pass-cli)
2. Install to one of these locations (or set custom path in preferences):
   - `~/.local/bin/pass-cli`
   - `/usr/local/bin/pass-cli`
   - `/opt/homebrew/bin/pass-cli`
3. Authenticate: `pass-cli login`

## Commands

### Search Items

Search across all vaults and quickly access any item.

- Filter by category (Login, Alias, Note, Credit Card, Identity, WiFi, SSH Key)
- Favorites shown first
- View details with metadata sidebar
- Copy credentials with one keystroke

### Browse Vaults

Navigate vaults and browse items within each.

### Password

Generate passwords and check strength.

- **Random Password** — Length 8-64, uppercase, numbers, symbols
- **Passphrase** — 3-10 words, configurable separator
- **Strength Check** — Detailed analysis with feedback

## Item Types

| Type              | Fields                         | Actions                    |
| ----------------- | ------------------------------ | -------------------------- |
| **Login**         | Username, password, URLs, TOTP | Copy credentials, open URL |
| **Alias**         | Email alias                    | Copy alias                 |
| **Secure Note**   | Note content                   | Copy note                  |
| **Credit Card**   | Number, expiry, CVV, PIN       | Copy card details          |
| **Identity**      | Name, email, phone             | Copy fields                |
| **WiFi**          | SSID, password, security       | Copy network/password      |
| **SSH Key**       | Public key, fingerprint        | Copy key/fingerprint       |
| **Custom Fields** | Text or hidden values          | Copy, reveal hidden        |

## Preferences

| Setting          | Description                | Default       |
| ---------------- | -------------------------- | ------------- |
| CLI Path         | Custom `pass-cli` location | Auto-detect   |
| Primary Action   | Default Enter behavior     | Copy Password |
| Close After Copy | Auto-close after copying   | Off           |

## Keyboard Shortcuts

| Shortcut | Action         |
| -------- | -------------- |
| `Enter`  | Primary action |
| `⌘⇧P`    | Copy Password  |
| `⌘⇧U`    | Copy Username  |
| `⌘⇧T`    | Copy TOTP      |
| `⌘O`     | Open URL       |

## Features

- **Fast** — Parallel fetching across vaults
- **Cached** — Instant loads with stale-while-revalidate
- **Secure** — Hidden fields masked, concealed clipboard

## License

MIT
