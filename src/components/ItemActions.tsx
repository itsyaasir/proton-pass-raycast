import {
  Action,
  ActionPanel,
  Icon,
  Clipboard,
  showHUD,
  closeMainWindow,
  showToast,
  Toast,
  confirmAlert,
  Alert,
  open,
} from "@raycast/api";
import { getPreferences, PassItem, actionsForItem } from "../types";
import { getPassword, getTotp, getPrimaryUrl } from "../utils";
import { CopyPasteAction } from "./CopyPasteAction";

interface ItemActionsProps {
  item: PassItem;
}

export function ItemActions({ item }: ItemActionsProps) {
  const { closeAfterCopy } = getPreferences();

  // Get actions for this item based on category and preferences
  const actions = actionsForItem(item);

  return (
    <>
      <ActionPanel.Section title="Quick Actions">
        {actions.map((actionId) => {
          switch (actionId) {
            case "copy-password":
              return CopyPassword(item, closeAfterCopy);
            case "copy-username":
              return CopyUsername(item, closeAfterCopy);
            case "copy-totp":
              return CopyTotp(item, closeAfterCopy);
            case "open-browser":
              return OpenInBrowser(item);
            case "paste-password":
              return PastePassword(item);
            case "paste-username":
              return PasteUsername(item);
            case "paste-totp":
              return PasteTotp(item);
            case "copy-note":
              return CopyNote(item, closeAfterCopy);
            case "copy-card-number":
              return CopyCardNumber(item, closeAfterCopy);
            case "copy-alias":
              return CopyAlias(item, closeAfterCopy);
            default:
              return null;
          }
        })}
      </ActionPanel.Section>

      <ActionPanel.Section title="Open">
        <Action
          title="Open Proton Pass"
          icon={Icon.AppWindow}
          onAction={async () => {
            const confirmed = await confirmAlert({
              title: "Open Proton Pass?",
              message:
                "Proton Pass doesn't support deep linking, so the app will open but won't navigate to this specific item.",
              primaryAction: {
                title: "Open App",
                style: Alert.ActionStyle.Default,
              },
              dismissAction: {
                title: "Cancel",
              },
            });
            if (confirmed) {
              await open("/Applications/Proton Pass.app");
            }
          }}
        />
      </ActionPanel.Section>
    </>
  );
}

// Action factory functions

function CopyPassword(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-password"
      title="Copy Password"
      icon={Icon.Key}
      shortcut={{ modifiers: ["cmd", "opt"], key: "c" }}
      onAction={async () => {
        try {
          const password = item.password || getPassword(item.shareId, item.id);
          if (!password) {
            await showToast({
              style: Toast.Style.Failure,
              title: "No password found",
            });
            return;
          }
          await Clipboard.copy(password, { concealed: true });
          await showHUD("Password copied");
          if (closeAfterCopy) await closeMainWindow();
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to copy password",
            message: String(error),
          });
        }
      }}
    />
  );
}

function CopyUsername(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-username"
      title="Copy Username"
      icon={Icon.Person}
      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
      onAction={async () => {
        const username = item.username || item.email;
        if (!username) return;
        await Clipboard.copy(username);
        await showHUD("Username copied");
        if (closeAfterCopy) await closeMainWindow();
      }}
    />
  );
}

function CopyTotp(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-totp"
      title="Copy One-Time Password"
      icon={Icon.Clock}
      shortcut={{ modifiers: ["cmd", "ctrl"], key: "c" }}
      onAction={async () => {
        try {
          const totp = getTotp(item.shareId, item.id);
          if (!totp) {
            await showToast({
              style: Toast.Style.Failure,
              title: "No TOTP available",
            });
            return;
          }
          await Clipboard.copy(totp);
          await showHUD("TOTP code copied");
          if (closeAfterCopy) await closeMainWindow();
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to copy TOTP",
            message: String(error),
          });
        }
      }}
    />
  );
}

function OpenInBrowser(item: PassItem) {
  const url = getPrimaryUrl(item.urls);
  if (!url) return null;

  return (
    <Action.OpenInBrowser
      key="open-browser"
      title="Open in Browser"
      url={url}
      shortcut={{ modifiers: ["opt"], key: "return" }}
    />
  );
}

function PastePassword(item: PassItem) {
  return (
    <CopyPasteAction
      key="paste-password"
      item={item}
      field="password"
      isPaste={true}
      shortcut={{ modifiers: ["cmd", "opt"], key: "v" }}
    />
  );
}

function PasteUsername(item: PassItem) {
  return (
    <CopyPasteAction
      key="paste-username"
      item={item}
      field="username"
      isPaste={true}
      shortcut={{ modifiers: ["cmd", "shift"], key: "v" }}
    />
  );
}

function PasteTotp(item: PassItem) {
  return (
    <CopyPasteAction
      key="paste-totp"
      item={item}
      field="totp"
      isPaste={true}
      shortcut={{ modifiers: ["cmd", "ctrl"], key: "v" }}
    />
  );
}

function CopyNote(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-note"
      title="Copy Note"
      icon={Icon.Document}
      onAction={async () => {
        const content = item.note || "";
        await Clipboard.copy(content);
        await showHUD("Note copied");
        if (closeAfterCopy) await closeMainWindow();
      }}
    />
  );
}

function CopyCardNumber(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-card-number"
      title="Copy Card Number"
      icon={Icon.CreditCard}
      onAction={async () => {
        const cardNumber = item.cardNumber || "";
        if (!cardNumber) {
          await showToast({
            style: Toast.Style.Failure,
            title: "No card number found",
          });
          return;
        }
        await Clipboard.copy(cardNumber, { concealed: true });
        await showHUD("Card number copied");
        if (closeAfterCopy) await closeMainWindow();
      }}
    />
  );
}

function CopyAlias(item: PassItem, closeAfterCopy: boolean) {
  return (
    <Action
      key="copy-alias"
      title="Copy Alias Email"
      icon={Icon.Envelope}
      onAction={async () => {
        const aliasEmail = item.aliasEmail || "";
        if (!aliasEmail) {
          await showToast({
            style: Toast.Style.Failure,
            title: "No alias email found",
          });
          return;
        }
        await Clipboard.copy(aliasEmail);
        await showHUD("Alias copied");
        if (closeAfterCopy) await closeMainWindow();
      }}
    />
  );
}
