import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  openExtensionPreferences,
} from "@raycast/api";

const INSTRUCTION = `
# Setup Guide for Proton Pass Extension

This extension requires the **Proton Pass CLI** to access your vault data.

---

## Step 1: Install the Proton Pass CLI

Download and install the Proton Pass CLI from the official source :


### Manual Installation
1. Download from [Proton Pass Downloads](https://protonpass.github.io/pass-cli/)
2. Follow the installation instructions for your operating system.
3. Ensure the CLI binary is in your system's PATH.

---

## Step 2: Verify Installation

Run the following command in your terminal to verify the CLI is installed:

\`\`\`bash
pass-cli --version
\`\`\`

You should see the version number if installed correctly.

---

## Step 3: Login to Proton Pass

Authenticate with your Proton account:

\`\`\`bash
pass-cli login
\`\`\`

Follow the prompts to enter your credentials. You may need to complete 2FA if enabled.

---

## Step 4: Test the Connection

Verify everything is working by listing your vaults:

\`\`\`bash
pass-cli test
\`\`\`

If you see your vaults listed, you're all set!

---

## Common CLI Paths

The extension looks for the CLI in these locations:
- \`~/.local/bin/pass-cli\`

You can also set a custom path in the extension preferences.

---

## Need Help?

- [Proton Pass Support](https://proton.me/support/pass)
- [Report an Issue](https://github.com/raycast/extensions/issues/new/choose)
`;

export function Guide() {
  return (
    <Detail
      markdown={INSTRUCTION}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Download Proton Pass CLI"
            url="https://protonpass.github.io/pass-cli/"
            icon={Icon.Download}
          />
          <Action
            title="Open Extension Preferences"
            icon={Icon.Gear}
            onAction={openExtensionPreferences}
          />
          <Action.CopyToClipboard
            title="Copy Install Command"
            content="brew install proton-pass"
            icon={Icon.Clipboard}
          />
        </ActionPanel>
      }
    />
  );
}
