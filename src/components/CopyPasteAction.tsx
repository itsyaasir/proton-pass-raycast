import {
  Action,
  Clipboard,
  Icon,
  Keyboard,
  showHUD,
  showToast,
  Toast,
  closeMainWindow,
} from "@raycast/api";
import { PassItem, getPreferences } from "../types";
import { getPassword, getTotp } from "../utils";
import { useFrontmostApp } from "../hooks";

type FieldType =
  | "password"
  | "username"
  | "totp"
  | "note"
  | "cardNumber"
  | "cvv"
  | "alias"
  | "ssid"
  | "wifiPassword"
  | "publicKey"
  | "fingerprint";

interface CopyPasteActionProps {
  item: PassItem;
  field: FieldType;
  isPaste?: boolean;
  shortcut?: Keyboard.Shortcut;
}

const FIELD_CONFIG: Record<
  FieldType,
  {
    title: string;
    icon: Icon;
    concealed: boolean;
    getValue: (item: PassItem) => string | null;
  }
> = {
  password: {
    title: "Password",
    icon: Icon.Key,
    concealed: true,
    getValue: (item) => item.password || getPassword(item.shareId, item.id),
  },
  username: {
    title: "Username",
    icon: Icon.Person,
    concealed: false,
    getValue: (item) => item.username || item.email || null,
  },
  totp: {
    title: "One-Time Password",
    icon: Icon.Clock,
    concealed: false,
    getValue: (item) => getTotp(item.shareId, item.id),
  },
  note: {
    title: "Note",
    icon: Icon.Document,
    concealed: false,
    getValue: (item) => item.note || null,
  },
  cardNumber: {
    title: "Card Number",
    icon: Icon.CreditCard,
    concealed: true,
    getValue: (item) => item.cardNumber || null,
  },
  cvv: {
    title: "CVV",
    icon: Icon.Lock,
    concealed: true,
    getValue: (item) => item.cvv || null,
  },
  alias: {
    title: "Alias Email",
    icon: Icon.Envelope,
    concealed: false,
    getValue: (item) => item.aliasEmail || null,
  },
  ssid: {
    title: "Network Name",
    icon: Icon.Wifi,
    concealed: false,
    getValue: (item) => item.ssid || null,
  },
  wifiPassword: {
    title: "WiFi Password",
    icon: Icon.Lock,
    concealed: true,
    getValue: (item) => item.wifiPassword || null,
  },
  publicKey: {
    title: "Public Key",
    icon: Icon.Key,
    concealed: false,
    getValue: (item) => item.publicKey || null,
  },
  fingerprint: {
    title: "Fingerprint",
    icon: Icon.Fingerprint,
    concealed: false,
    getValue: (item) => item.fingerprint || null,
  },
};

export function CopyPasteAction({
  item,
  field,
  isPaste = false,
  shortcut,
}: CopyPasteActionProps) {
  const { closeAfterCopy } = getPreferences();
  const frontmostApp = useFrontmostApp(isPaste);
  const config = FIELD_CONFIG[field];

  const handleAction = async () => {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: isPaste
        ? `Pasting ${config.title}${frontmostApp.name ? ` to ${frontmostApp.name}` : ""}...`
        : `Copying ${config.title}...`,
    });

    try {
      const value = config.getValue(item);

      if (!value) {
        toast.style = Toast.Style.Failure;
        toast.title = `No ${config.title.toLowerCase()} found`;
        return;
      }

      if (isPaste) {
        await Clipboard.paste(value);
        toast.style = Toast.Style.Success;
        toast.title = `Pasted ${config.title}${frontmostApp.name ? ` to ${frontmostApp.name}` : ""}`;
        await showHUD(
          `Pasted ${config.title}${frontmostApp.name ? ` to ${frontmostApp.name}` : ""}`,
        );
        await closeMainWindow();
      } else {
        await Clipboard.copy(value, { concealed: config.concealed });
        toast.style = Toast.Style.Success;
        toast.title = `${config.title} copied`;
        await showHUD(`${config.title} copied`);
        if (closeAfterCopy) {
          await closeMainWindow();
        }
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = `Failed to ${isPaste ? "paste" : "copy"} ${config.title.toLowerCase()}`;
      toast.message = String(error);
    }
  };

  const title = isPaste
    ? `Paste ${config.title}${frontmostApp.name ? ` to ${frontmostApp.name}` : ""}`
    : `Copy ${config.title}`;

  const icon = isPaste ? (frontmostApp.icon ?? Icon.Clipboard) : config.icon;

  return (
    <Action
      title={title}
      icon={icon}
      onAction={handleAction}
      shortcut={shortcut}
    />
  );
}
