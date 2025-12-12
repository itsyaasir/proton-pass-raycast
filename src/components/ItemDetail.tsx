import {
  Detail,
  Action,
  ActionPanel,
  Icon,
  Clipboard,
  showHUD,
  closeMainWindow,
  showToast,
  Toast,
  Color,
  confirmAlert,
  Alert,
  open,
} from "@raycast/api";
import React from "react";
import {
  PassItem,
  getPreferences,
  isLoginItem,
  hasTotp,
  getCategoryDisplayName,
} from "../types";
import { getPassword, getTotp, getPrimaryUrl } from "../utils";
import { CopyPasteAction } from "./CopyPasteAction";

interface ItemDetailProps {
  item: PassItem;
}
export function ItemDetail({ item }: ItemDetailProps) {
  const { closeAfterCopy } = getPreferences();

  const markdown = buildMarkdown(item);

  return (
    <Detail
      markdown={markdown}
      metadata={<ItemMetadata item={item} />}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Copy">
            {isLoginItem(item) && (
              <>
                <Action
                  title="Copy Password"
                  icon={Icon.Key}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
                  onAction={async () => {
                    const password =
                      item.password || getPassword(item.shareId, item.id);
                    if (password) {
                      await Clipboard.copy(password, { concealed: true });
                      await showHUD("Password copied");
                      if (closeAfterCopy) await closeMainWindow();
                    } else {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: "No password found",
                      });
                    }
                  }}
                />
                {(item.username || item.email) && (
                  <Action
                    title="Copy Username"
                    icon={Icon.Person}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "u" }}
                    onAction={async () => {
                      const username = item.username || item.email || "";
                      await Clipboard.copy(username);
                      await showHUD("Username copied");
                      if (closeAfterCopy) await closeMainWindow();
                    }}
                  />
                )}
                {hasTotp(item) && (
                  <Action
                    title="Copy TOTP"
                    icon={Icon.Clock}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "t" }}
                    onAction={async () => {
                      const totp = getTotp(item.shareId, item.id);
                      if (totp) {
                        await Clipboard.copy(totp);
                        await showHUD("TOTP copied");
                        if (closeAfterCopy) await closeMainWindow();
                      } else {
                        await showToast({
                          style: Toast.Style.Failure,
                          title: "No TOTP found",
                        });
                      }
                    }}
                  />
                )}
              </>
            )}
            {item.category === "Alias" && item.aliasEmail && (
              <Action.CopyToClipboard
                title="Copy Alias Email"
                content={item.aliasEmail}
                icon={Icon.Envelope}
              />
            )}
            {item.category === "Note" && item.note && (
              <Action.CopyToClipboard
                title="Copy Note"
                content={item.note}
                icon={Icon.Document}
              />
            )}
            {item.category === "CreditCard" && (
              <>
                {item.cardNumber && (
                  <Action
                    title="Copy Card Number"
                    icon={Icon.CreditCard}
                    onAction={async () => {
                      await Clipboard.copy(item.cardNumber || "", {
                        concealed: true,
                      });
                      await showHUD("Card number copied");
                      if (closeAfterCopy) await closeMainWindow();
                    }}
                  />
                )}
                {item.cvv && (
                  <Action
                    title="Copy CVV"
                    icon={Icon.Lock}
                    onAction={async () => {
                      await Clipboard.copy(item.cvv || "", { concealed: true });
                      await showHUD("CVV copied");
                      if (closeAfterCopy) await closeMainWindow();
                    }}
                  />
                )}
              </>
            )}
            {item.category === "WiFi" && (
              <>
                {item.ssid && (
                  <Action.CopyToClipboard
                    title="Copy Network Name"
                    content={item.ssid}
                    icon={Icon.Wifi}
                  />
                )}
                {item.wifiPassword && (
                  <Action
                    title="Copy WiFi Password"
                    icon={Icon.Lock}
                    onAction={async () => {
                      await Clipboard.copy(item.wifiPassword || "", {
                        concealed: true,
                      });
                      await showHUD("WiFi password copied");
                      if (closeAfterCopy) await closeMainWindow();
                    }}
                  />
                )}
              </>
            )}
            {item.category === "SSHKey" && (
              <>
                {item.publicKey && (
                  <Action.CopyToClipboard
                    title="Copy Public Key"
                    content={item.publicKey}
                    icon={Icon.Key}
                  />
                )}
                {item.fingerprint && (
                  <Action.CopyToClipboard
                    title="Copy Fingerprint"
                    content={item.fingerprint}
                    icon={Icon.Fingerprint}
                  />
                )}
              </>
            )}
          </ActionPanel.Section>

          {isLoginItem(item) && (
            <ActionPanel.Section title="Paste">
              <CopyPasteAction
                item={item}
                field="password"
                isPaste={true}
                shortcut={{ modifiers: ["cmd", "opt"], key: "v" }}
              />
              {(item.username || item.email) && (
                <CopyPasteAction
                  item={item}
                  field="username"
                  isPaste={true}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "v" }}
                />
              )}
              {hasTotp(item) && (
                <CopyPasteAction
                  item={item}
                  field="totp"
                  isPaste={true}
                  shortcut={{ modifiers: ["cmd", "ctrl"], key: "v" }}
                />
              )}
            </ActionPanel.Section>
          )}

          <ActionPanel.Section title="Open">
            {isLoginItem(item) && item.urls && item.urls.length > 0 && (
              <Action.OpenInBrowser
                title="Open in Browser"
                url={getPrimaryUrl(item.urls) || ""}
              />
            )}
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

          {item.extraFields && item.extraFields.length > 0 && (
            <ActionPanel.Section title="Custom Fields">
              {item.extraFields.map((field, index) => (
                <React.Fragment key={`field-${index}`}>
                  <Action
                    title={`Copy ${field.name}`}
                    icon={Icon.Clipboard}
                    onAction={async () => {
                      await Clipboard.copy(field.value, {
                        concealed: field.isHidden,
                      });
                      await showHUD(`${field.name} copied`);
                      if (closeAfterCopy) await closeMainWindow();
                    }}
                  />
                  {field.isHidden && (
                    <Action
                      title={`Reveal ${field.name}`}
                      icon={Icon.Eye}
                      onAction={async () => {
                        await confirmAlert({
                          title: field.name,
                          message: field.value,
                          primaryAction: {
                            title: "Copy",
                            onAction: async () => {
                              await Clipboard.copy(field.value, {
                                concealed: true,
                              });
                              await showHUD(`${field.name} copied`);
                            },
                          },
                          dismissAction: {
                            title: "Close",
                          },
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </ActionPanel.Section>
          )}

          <ActionPanel.Section title="Other">
            <Action.CopyToClipboard
              title="Copy Item ID"
              content={item.id}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function buildMarkdown(item: PassItem): string {
  const lines: string[] = [];
  const icon = getCategoryEmoji(item.category);

  lines.push(`# ${icon} ${item.name}`);

  // Only show notes section if there are notes
  if (item.note) {
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("### Notes");
    lines.push("");
    lines.push(item.note);
  }

  // Show custom fields in markdown if present
  if (item.extraFields && item.extraFields.length > 0) {
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("### Custom Fields");
    lines.push("");
    for (const field of item.extraFields) {
      lines.push(`#### ${field.name}`);
      if (field.isHidden) {
        lines.push("`••••••••` *(hidden)*");
      } else if (field.value) {
        lines.push(`\`${field.value}\``);
      } else {
        lines.push("*empty*");
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function getCategoryEmoji(category: string): string {
  switch (category) {
    case "Login":
      return "🔐";
    case "Alias":
      return "📧";
    case "Note":
      return "📝";
    case "CreditCard":
      return "💳";
    case "Identity":
      return "👤";
    default:
      return "📄";
  }
}

function ItemMetadata({ item }: { item: PassItem }) {
  const primaryUrl =
    isLoginItem(item) && item.urls ? getPrimaryUrl(item.urls) : null;

  return (
    <Detail.Metadata>
      {/* Header section with type and vault */}
      <Detail.Metadata.TagList title="Type">
        <Detail.Metadata.TagList.Item
          text={getCategoryDisplayName(item.category)}
          color={getCategoryColor(item.category)}
        />
        {item.favorite && (
          <Detail.Metadata.TagList.Item
            text="★ Favorite"
            color={Color.Yellow}
          />
        )}
      </Detail.Metadata.TagList>

      {item.vaultName && (
        <Detail.Metadata.Label
          title="Vault"
          text={item.vaultName}
          icon={Icon.Folder}
        />
      )}

      <Detail.Metadata.Separator />

      {/* Login-specific metadata */}
      {isLoginItem(item) && (
        <>
          {item.username && (
            <Detail.Metadata.Label
              title="Username"
              text={item.username}
              icon={Icon.Person}
            />
          )}
          {item.email && (
            <Detail.Metadata.Label
              title="Email"
              text={item.email}
              icon={Icon.Envelope}
            />
          )}
          <Detail.Metadata.Label
            title="Password"
            text="••••••••••••"
            icon={Icon.Key}
          />
          {hasTotp(item) && (
            <Detail.Metadata.TagList title="2FA">
              <Detail.Metadata.TagList.Item
                text="TOTP Enabled"
                color={Color.Green}
              />
            </Detail.Metadata.TagList>
          )}
          {primaryUrl && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Link
                title="Website"
                target={primaryUrl}
                text={getDomainFromUrl(primaryUrl)}
              />
            </>
          )}
          {item.urls && item.urls.length > 1 && (
            <Detail.Metadata.Label
              title="Additional URLs"
              text={`+${item.urls.length - 1} more`}
              icon={Icon.Link}
            />
          )}
        </>
      )}

      {/* Alias-specific metadata */}
      {item.category === "Alias" && item.aliasEmail && (
        <Detail.Metadata.Label
          title="Alias Email"
          text={item.aliasEmail}
          icon={Icon.Envelope}
        />
      )}

      {/* Credit Card-specific metadata */}
      {item.category === "CreditCard" && (
        <>
          {item.cardholderName && (
            <Detail.Metadata.Label
              title="Cardholder"
              text={item.cardholderName}
              icon={Icon.Person}
            />
          )}
          <Detail.Metadata.Label
            title="Card Number"
            text="•••• •••• •••• ••••"
            icon={Icon.CreditCard}
          />
          {item.expirationDate && (
            <Detail.Metadata.Label
              title="Expires"
              text={item.expirationDate}
              icon={Icon.Calendar}
            />
          )}
          <Detail.Metadata.Label title="CVV" text="•••" icon={Icon.Lock} />
        </>
      )}

      {/* Identity-specific metadata */}
      {item.category === "Identity" && (
        <>
          {(item.firstName || item.lastName) && (
            <Detail.Metadata.Label
              title="Full Name"
              text={[item.firstName, item.lastName].filter(Boolean).join(" ")}
              icon={Icon.Person}
            />
          )}
          {item.email && (
            <Detail.Metadata.Label
              title="Email"
              text={item.email}
              icon={Icon.Envelope}
            />
          )}
          {item.phone && (
            <Detail.Metadata.Label
              title="Phone"
              text={item.phone}
              icon={Icon.Phone}
            />
          )}
        </>
      )}

      {/* WiFi-specific metadata */}
      {item.category === "WiFi" && (
        <>
          {item.ssid && (
            <Detail.Metadata.Label
              title="Network Name (SSID)"
              text={item.ssid}
              icon={Icon.Wifi}
            />
          )}
          <Detail.Metadata.Label
            title="Password"
            text="••••••••"
            icon={Icon.Lock}
          />
          {item.wifiSecurity && (
            <Detail.Metadata.Label
              title="Security"
              text={item.wifiSecurity}
              icon={Icon.Shield}
            />
          )}
        </>
      )}

      {/* SSH Key-specific metadata */}
      {item.category === "SSHKey" && (
        <>
          {item.fingerprint && (
            <Detail.Metadata.Label
              title="Fingerprint"
              text={item.fingerprint}
              icon={Icon.Fingerprint}
            />
          )}
          {item.publicKey && (
            <Detail.Metadata.Label
              title="Public Key"
              text={item.publicKey.substring(0, 30) + "..."}
              icon={Icon.Key}
            />
          )}
        </>
      )}

      {/* Custom fields */}
      {item.extraFields && item.extraFields.length > 0 && (
        <>
          <Detail.Metadata.Separator />
          {item.extraFields.map((field, index) => (
            <Detail.Metadata.Label
              key={index}
              title={field.name}
              text={field.isHidden ? "••••••••" : field.value || "—"}
              icon={field.isHidden ? Icon.EyeDisabled : Icon.Text}
            />
          ))}
        </>
      )}

      {/* Footer with timestamps */}
      <Detail.Metadata.Separator />
      <Detail.Metadata.Label
        title="Created"
        text={formatDate(item.createdAt)}
        icon={Icon.Clock}
      />
    </Detail.Metadata>
  );
}

function getCategoryColor(category: string): Color {
  switch (category) {
    case "Login":
      return Color.Blue;
    case "Alias":
      return Color.Purple;
    case "Note":
      return Color.Orange;
    case "CreditCard":
      return Color.Green;
    case "Identity":
      return Color.Magenta;
    default:
      return Color.SecondaryText;
  }
}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
