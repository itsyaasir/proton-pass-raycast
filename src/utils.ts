import { execFileSync } from "child_process";
import { existsSync } from "fs";
import {
  getPreferences,
  User,
  CLINotFoundError,
  AuthenticationError,
  ProtonPassError,
} from "./types";

// CLI Binary paths to check
const CLI_PATHS = [
  `${process.env.HOME}/.local/bin/pass-cli`,
  "/usr/local/bin/pass-cli",
  "/opt/homebrew/bin/pass-cli",
  "/usr/bin/pass-cli",
  `${process.env.HOME}/.local/bin/proton-pass-cli`,
];

/**
 * Get the path to the Proton Pass CLI binary
 */
export function getCliPath(): string {
  const { cliPath } = getPreferences();

  if (cliPath && existsSync(cliPath)) {
    return cliPath;
  }

  for (const path of CLI_PATHS) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new CLINotFoundError();
}

/**
 * Execute a CLI command and return the result
 */
function runCommand(args: string[]): string {
  const cliPath = getCliPath();

  try {
    const result = execFileSync(cliPath, args, {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 50 * 1024 * 1024,
    });
    return result.trim();
  } catch (error) {
    handleCliError(error);
  }
}

/**
 * Execute a CLI command and parse JSON result
 */
function runCommandJSON<T>(args: string[]): T {
  const result = runCommand([...args, "--output", "json"]);
  try {
    return JSON.parse(result) as T;
  } catch {
    throw new ProtonPassError(
      `Failed to parse CLI output: ${result.substring(0, 200)}...`,
      "Parse Error",
    );
  }
}

/**
 * Handle CLI errors and throw appropriate custom errors
 */
function handleCliError(error: unknown): never {
  const err = error as {
    message?: string;
    code?: string;
    stderr?: string;
    status?: number;
  };
  const message = err.message || err.stderr || "Unknown error";

  if (err.code === "ENOENT") {
    throw new CLINotFoundError();
  }

  if (
    message.includes("not logged in") ||
    message.includes("authentication") ||
    message.includes("sign in") ||
    message.includes("login required")
  ) {
    throw new AuthenticationError();
  }

  throw new ProtonPassError(message);
}

/**
 * Check if the CLI is installed
 */
export function isCliInstalled(): boolean {
  try {
    getCliPath();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  try {
    runCommand(["info"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current user info
 */
export function getUser(): User | null {
  try {
    const result = runCommandJSON<User>(["user"]);
    return result;
  } catch {
    return null;
  }
}

/**
 * Get a specific field from an item using Pass URI
 */
function getItemField(shareId: string, itemId: string, field: string): string {
  try {
    const uri = `pass://${shareId}/${itemId}/${field}`;
    return runCommand(["item", "view", uri]);
  } catch {
    return "";
  }
}

/**
 * Get the password for an item
 */
export function getPassword(shareId: string, itemId: string): string {
  return getItemField(shareId, itemId, "password");
}

/**
 * Get the TOTP code for an item
 */
export function getTotp(shareId: string, itemId: string): string | null {
  try {
    const result = runCommandJSON<Record<string, string>>([
      "item",
      "totp",
      "--share-id",
      shareId,
      "--item-id",
      itemId,
    ]);
    const values = Object.values(result);
    return values.length > 0 ? values[0] : null;
  } catch {
    return null;
  }
}

/**
 * Generate a random password
 */
export function generatePassword(options: {
  length?: number;
  numbers?: boolean;
  symbols?: boolean;
  uppercase?: boolean;
}): string {
  const {
    length = 20,
    numbers = true,
    symbols = true,
    uppercase = true,
  } = options;

  const args = ["password", "generate", "random"];
  args.push("--length", String(length));
  args.push("--numbers", String(numbers));
  args.push("--uppercase", String(uppercase));
  args.push("--symbols", String(symbols));

  try {
    return runCommand(args);
  } catch {
    return generateLocalPassword(length, numbers, symbols, uppercase);
  }
}

/**
 * Generate a memorable passphrase
 */
export function generatePassphrase(options: {
  words?: number;
  separator?:
    | "hyphens"
    | "spaces"
    | "periods"
    | "commas"
    | "underscores"
    | "numbers"
    | "numbers-and-symbols";
  capitalize?: boolean;
  numbers?: boolean;
}): string {
  const {
    words = 5,
    separator = "hyphens",
    capitalize = true,
    numbers = true,
  } = options;

  const args = ["password", "generate", "passphrase"];
  args.push("--count", String(words));
  args.push("--separator", separator);
  args.push("--capitalise", String(capitalize));
  args.push("--numbers", String(numbers));

  return runCommand(args);
}

/**
 * Get password strength score
 */
export function getPasswordScore(password: string): {
  numericScore: number;
  passwordScore: string;
  penalties: string[];
} | null {
  try {
    const result = runCommandJSON<{
      numeric_score: number;
      password_score: string;
      penalties: string[];
    }>(["password", "score", password]);

    return {
      numericScore: result.numeric_score,
      passwordScore: result.password_score,
      penalties: result.penalties,
    };
  } catch {
    return null;
  }
}

/**
 * Local password generation fallback
 */
function generateLocalPassword(
  length: number,
  numbers: boolean,
  symbols: boolean,
  uppercase: boolean,
): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let chars = lowercase;
  if (uppercase) chars += uppercaseChars;
  if (numbers) chars += numberChars;
  if (symbols) chars += symbolChars;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Get primary URL from a login item
 */
export function getPrimaryUrl(urls?: string[]): string | undefined {
  if (!urls || urls.length === 0) return undefined;
  return urls[0];
}
