import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  openExtensionPreferences,
} from "@raycast/api";
import { CLINotFoundError, AuthenticationError } from "../types";

interface ErrorViewProps {
  error: Error;
}

export function ErrorView({ error }: ErrorViewProps) {
  let markdown: string;
  let actions: React.ReactNode;

  if (error instanceof CLINotFoundError) {
    markdown = `
# Proton Pass CLI Not Found

The Proton Pass CLI (\`pass-cli\`) could not be found on your system.

---

## How to Fix

### Option 1: Manual Installation
Follow these steps to install the CLI:

1. Download the CLI from the [official Proton Pass downloads page](https://protonpass.github.io/pass-cli/).

2. Follow the installation instructions for your operating system.

3. Ensure the CLI binary is in your system's PATH.

### Option 2: Set Custom Path
If the CLI is installed in a custom location, set the path in extension preferences.

---

## Verify Installation

\`\`\`bash
pass-cli --version
\`\`\`

## Checked Locations

The extension looked in these locations:
- \`~/.local/bin/pass-cli\`
`;

    actions = (
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
    );
  } else if (error instanceof AuthenticationError) {
    markdown = `
# Authentication Required

You need to log in to Proton Pass CLI to use this extension.

---

## How to Login

Run this command in your terminal:

\`\`\`bash
pass-cli login
\`\`\`

Follow the prompts to:
1. Enter your Proton email
2. Enter your password
3. Complete 2FA (if enabled)

---

## Verify Login

After logging in, verify with:

\`\`\`bash
pass-cli vault list
\`\`\`

You should see your vaults listed.

---

## Session Expired?

If your session expired, simply run \`pass-cli login\` again.
`;

    actions = (
      <ActionPanel>
        <Action.CopyToClipboard
          title="Copy Login Command"
          content="pass-cli login"
          icon={Icon.Terminal}
        />
        <Action
          title="Open Extension Preferences"
          icon={Icon.Gear}
          onAction={openExtensionPreferences}
        />
      </ActionPanel>
    );
  } else {
    // Generic error
    markdown = `
# Something Went Wrong

An error occurred while communicating with the Proton Pass CLI.

---

## Error Details

\`\`\`
${error.message}
\`\`\`

---

## Troubleshooting

1. **Check CLI is working**: Run \`pass-cli vault test\` in terminal
2. **Re-authenticate**: Run \`pass-cli login\`
3. **Check preferences**: Verify CLI path is correct
4. **Restart Raycast**: Sometimes a fresh start helps

---

## Still Having Issues?

[Report an Issue](https://github.com/raycast/extensions/issues/new/choose)
`;

    actions = (
      <ActionPanel>
        <Action.CopyToClipboard
          title="Copy Error Message"
          content={error.message}
          icon={Icon.Clipboard}
        />
        <Action
          title="Open Extension Preferences"
          icon={Icon.Gear}
          onAction={openExtensionPreferences}
        />
        <Action.CopyToClipboard
          title="Copy Login Command"
          content="pass-cli login"
          icon={Icon.Terminal}
        />
      </ActionPanel>
    );
  }

  return <Detail markdown={markdown} actions={actions} />;
}
