import { getPreferenceValues, Icon } from "@raycast/api";

// Extension Preferences
export interface Preferences {
  cliPath?: string;
  primaryAction: ActionType;
  secondaryAction: ActionType;
  closeAfterCopy: boolean;
}

export type ActionType =
  | "copy-password"
  | "copy-username"
  | "copy-totp"
  | "open-browser"
  | "paste-password"
  | "paste-username"
  | "paste-totp"
  | "copy-note"
  | "copy-card-number"
  | "copy-alias";

export function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

// Item Categories
export type ItemCategory =
  | "Login"
  | "Alias"
  | "Note"
  | "CreditCard"
  | "Identity"
  | "WiFi"
  | "SSHKey";

// ===================
// CLI Response Types
// ===================

export interface CLIVault {
  name: string;
  vault_id: string;
  share_id: string;
}

export interface CLIVaultsResponse {
  vaults: CLIVault[];
}

// Item structure - matches CLI output
export interface CLIItem {
  id: string;
  share_id: string;
  vault_id: string;
  content: {
    title: string;
    note: string;
    item_uuid: string;
    content: CLIItemContent;
    extra_fields: CLIExtraField[];
  };
  state: "Active" | "Trashed";
  flags: string[];
  create_time: string;
}

export interface CLIExtraField {
  name: string;
  content: {
    Text?: string;
    Hidden?: string;
  };
}

// Item content varies by type
export type CLIItemContent =
  | { Login: CLILoginContent }
  | { Alias: CLIAliasContent }
  | { Note: object }
  | { CreditCard: CLICreditCardContent }
  | { Identity: CLIIdentityContent }
  | { Custom: CLICustomContent }
  | { Wifi: CLIWiFiContent }
  | { SshKey: CLISSHKeyContent };

export interface CLICustomContent {
  sections?: unknown[];
}

export interface CLIWiFiContent {
  ssid?: string;
  password?: string;
  security?: string;
}

export interface CLISSHKeyContent {
  public_key?: string;
  private_key?: string;
  fingerprint?: string;
}

export interface CLILoginContent {
  email: string;
  username: string;
  password: string;
  urls: string[];
  totp_uri: string;
}

export interface CLIAliasContent {
  alias_email?: string;
}

export interface CLICreditCardContent {
  cardholder_name?: string;
  card_number?: string;
  expiration_date?: string;
  cvv?: string;
  pin?: string;
}

export interface CLIIdentityContent {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface CLIItemsResponse {
  items: CLIItem[];
}

// ===================
// App Types (normalized)
// ===================

export interface Vault {
  name: string;
  vaultId: string;
  shareId: string;
}

export interface PassItem {
  id: string;
  shareId: string;
  vaultId: string;
  name: string;
  category: ItemCategory;
  note: string;
  state: string;
  favorite: boolean;
  createdAt: string;
  // Login-specific
  username?: string;
  email?: string;
  password?: string;
  urls?: string[];
  totpUri?: string;
  // Alias-specific
  aliasEmail?: string;
  // Credit card specific
  cardholderName?: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  pin?: string;
  // Identity specific
  firstName?: string;
  lastName?: string;
  phone?: string;
  // WiFi specific
  ssid?: string;
  wifiPassword?: string;
  wifiSecurity?: string;
  // SSH Key specific
  publicKey?: string;
  fingerprint?: string;
  // Extra fields
  extraFields?: { name: string; value: string; isHidden?: boolean }[];
  // Vault name (added after fetching)
  vaultName?: string;
}

// User/Account info
export interface User {
  email: string;
  userId?: string;
  displayName?: string;
}

// Password score result
export interface PasswordScore {
  numericScore: number;
  passwordScore: "Vulnerable" | "Weak" | "Good" | "Strong";
  penalties: string[];
}

// ===================
// Error Types
// ===================

export class ProtonPassError extends Error {
  constructor(
    message: string,
    public title: string = "Proton Pass Error",
  ) {
    super(message);
    this.name = "ProtonPassError";
  }
}

export class CLINotFoundError extends ProtonPassError {
  constructor() {
    super(
      "Proton Pass CLI (pass-cli) not found. Please install it and ensure it's in your PATH.",
      "CLI Not Found",
    );
    this.name = "CLINotFoundError";
  }
}

export class AuthenticationError extends ProtonPassError {
  constructor(
    message = "Authentication required. Please run 'pass-cli login' in your terminal.",
  ) {
    super(message, "Authentication Required");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends ProtonPassError {
  constructor(message = "Item not found.") {
    super(message, "Not Found");
    this.name = "NotFoundError";
  }
}

// ===================
// Helper Functions
// ===================

/**
 * Get icon for item category
 */
export function getCategoryIcon(category: ItemCategory): Icon {
  const icons: Record<ItemCategory, Icon> = {
    Login: Icon.Key,
    Alias: Icon.Envelope,
    Note: Icon.Document,
    CreditCard: Icon.CreditCard,
    Identity: Icon.Person,
    WiFi: Icon.Wifi,
    SSHKey: Icon.Terminal,
  };
  return icons[category] || Icon.Document;
}

/**
 * Get display name for item category
 */
export function getCategoryDisplayName(category: ItemCategory): string {
  const names: Record<ItemCategory, string> = {
    Login: "Login",
    Alias: "Alias",
    Note: "Secure Note",
    CreditCard: "Credit Card",
    Identity: "Identity",
    WiFi: "WiFi",
    SSHKey: "SSH Key",
  };
  return names[category] || category;
}

/**
 * Check if an item is a login item
 */
export function isLoginItem(item: PassItem): boolean {
  return item.category === "Login";
}

/**
 * Check if an item has TOTP
 */
export function hasTotp(item: PassItem): boolean {
  return isLoginItem(item) && !!item.totpUri && item.totpUri.length > 0;
}

/**
 * Get item category from CLI content
 */
export function getItemCategory(
  content: CLIItemContent | null | undefined,
): ItemCategory {
  if (!content) return "Note"; // Default fallback for null content
  if ("Login" in content) return "Login";
  if ("Alias" in content) return "Alias";
  if ("Note" in content) return "Note";
  if ("CreditCard" in content) return "CreditCard";
  if ("Identity" in content) return "Identity";
  if ("Wifi" in content) return "WiFi";
  if ("SshKey" in content) return "SSHKey";
  if ("Custom" in content) return "Note"; // Custom items treated as notes
  return "Note"; // Default fallback
}

/**
 * Parse CLI item to app item
 */
export function parseCliItem(cliItem: CLIItem, vaultName?: string): PassItem {
  const content = cliItem.content?.content;
  const category = getItemCategory(content);
  const extraFields = cliItem.content?.extra_fields || [];

  const item: PassItem = {
    id: cliItem.id,
    shareId: cliItem.share_id,
    vaultId: cliItem.vault_id,
    name: cliItem.content?.title || "Untitled",
    category,
    note: cliItem.content?.note || "",
    state: cliItem.state,
    favorite:
      (cliItem.flags || []).includes("favorite") ||
      (cliItem.flags || []).includes("Favorite"),
    createdAt: cliItem.create_time,
    extraFields: extraFields.map((f) => ({
      name: f.name,
      value: f.content?.Text ?? f.content?.Hidden ?? "",
      isHidden: !!f.content?.Hidden,
    })),
    vaultName,
  };

  // Parse category-specific content (only if content exists)
  if (content) {
    if ("Login" in content) {
      const login = content.Login;
      item.username = login?.username;
      item.email = login?.email;
      item.password = login?.password;
      item.urls = login?.urls;
      item.totpUri = login?.totp_uri;
    } else if ("Alias" in content) {
      const alias = content.Alias;
      item.aliasEmail = alias?.alias_email;
    } else if ("CreditCard" in content) {
      const card = content.CreditCard;
      item.cardholderName = card?.cardholder_name;
      item.cardNumber = card?.card_number;
      item.expirationDate = card?.expiration_date;
      item.cvv = card?.cvv;
      item.pin = card?.pin;
    } else if ("Identity" in content) {
      const identity = content.Identity;
      item.firstName = identity?.first_name;
      item.lastName = identity?.last_name;
      item.email = identity?.email;
      item.phone = identity?.phone;
    } else if ("Wifi" in content) {
      const wifi = content.Wifi;
      item.ssid = wifi?.ssid;
      item.wifiPassword = wifi?.password;
      item.wifiSecurity = wifi?.security;
    } else if ("SshKey" in content) {
      const sshKey = content.SshKey;
      item.publicKey = sshKey?.public_key;
      item.fingerprint = sshKey?.fingerprint;
    }
  }

  return item;
}

/**
 * Parse CLI vault to app vault
 */
export function parseCliVault(cliVault: CLIVault): Vault {
  return {
    name: cliVault.name,
    vaultId: cliVault.vault_id,
    shareId: cliVault.share_id,
  };
}

/**
 * Get actions available for an item based on its category and user preferences
 */
export function actionsForItem(item: PassItem): ActionType[] {
  const preferences = getPreferences();

  // All actions in default order for login items
  const defaultLoginActions: ActionType[] = [
    "copy-password",
    "copy-username",
    "copy-totp",
    "open-browser",
    "paste-password",
    "paste-username",
    "paste-totp",
  ];

  // Prioritize primary and secondary actions, then append the rest and remove duplicates
  const deduplicatedActions = [
    ...new Set<ActionType>([
      preferences.primaryAction,
      preferences.secondaryAction,
      ...defaultLoginActions,
    ]),
  ];

  switch (item.category) {
    case "Login":
      // Filter out actions that don't apply to this item
      return deduplicatedActions.filter((action) => {
        switch (action) {
          case "copy-totp":
          case "paste-totp":
            return hasTotp(item);
          case "copy-username":
          case "paste-username":
            return !!(item.username || item.email);
          case "open-browser":
            return !!(item.urls && item.urls.length > 0);
          default:
            return true;
        }
      });

    case "Note":
      return ["copy-note"];

    case "CreditCard":
      return ["copy-card-number"];

    case "Alias":
      return ["copy-alias"];

    default:
      return [];
  }
}
