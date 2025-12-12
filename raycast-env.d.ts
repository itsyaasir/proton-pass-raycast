/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** CLI Path - Path to the Proton Pass CLI binary (leave empty for default) */
  "cliPath"?: string,
  /** Primary Action - Default action when pressing Enter on a login item */
  "primaryAction": "copy-password" | "copy-username" | "copy-totp" | "open-browser" | "paste-password" | "paste-username" | "paste-totp",
  /** Secondary Action - Action when pressing ⌘+Enter on a login item */
  "secondaryAction": "copy-password" | "copy-username" | "copy-totp" | "open-browser" | "paste-password" | "paste-username" | "paste-totp",
  /** Close After Copy - Close Raycast window after copying a value */
  "closeAfterCopy": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `items` command */
  export type Items = ExtensionPreferences & {}
  /** Preferences accessible in the `vaults` command */
  export type Vaults = ExtensionPreferences & {}
  /** Preferences accessible in the `password` command */
  export type Password = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `items` command */
  export type Items = {}
  /** Arguments passed to the `vaults` command */
  export type Vaults = {}
  /** Arguments passed to the `password` command */
  export type Password = {}
}

