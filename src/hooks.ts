import { getFrontmostApplication, showToast, Toast } from "@raycast/api";
import { useExec, useCachedPromise } from "@raycast/utils";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { useEffect, useState } from "react";
import {
  CLIVaultsResponse,
  CLIItemsResponse,
  PassItem,
  Vault,
  parseCliItem,
  parseCliVault,
} from "./types";
import { getCliPath } from "./utils";

const execFileAsync = promisify(execFile);

// Frontmost app type for paste actions
type FrontmostAppModel = {
  icon?: { fileIcon: string };
  name?: string;
};

/**
 * Hook to get the frontmost application (for paste context)
 */
export function useFrontmostApp(isEnabled = false): FrontmostAppModel {
  const [app, setApp] = useState<FrontmostAppModel>({});

  useEffect(() => {
    if (!isEnabled) return;

    const fetchFrontmostApp = async () => {
      try {
        const frontApp = await getFrontmostApplication();

        setApp({
          icon: frontApp.path ? { fileIcon: frontApp.path } : undefined,
          name: frontApp.name,
        });
      } catch {
        setApp({});
      }
    };

    fetchFrontmostApp();
  }, [isEnabled]);

  return app;
}

/**
 * Hook to fetch all vaults using useExec
 */
export function useVaults() {
  return useExec<Vault[]>(getCliPath(), ["vault", "list", "--output", "json"], {
    keepPreviousData: true,
    parseOutput: ({ stdout }) => {
      const response = JSON.parse(stdout) as CLIVaultsResponse;
      return response.vaults
        .map(parseCliVault)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    onError: async (error) => {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load vaults",
        message: error.message,
      });
    },
  });
}

/**
 * Hook to fetch items from a specific vault using useExec
 */
export function useItemsInVault(vaultName: string) {
  return useExec<PassItem[]>(
    getCliPath(),
    ["item", "list", vaultName, "--output", "json"],
    {
      execute: !!vaultName,
      keepPreviousData: true,
      parseOutput: ({ stdout }) => {
        const response = JSON.parse(stdout) as CLIItemsResponse;
        return response.items
          .filter((item) => item.state === "Active")
          .map((item) => parseCliItem(item, vaultName))
          .sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return a.name.localeCompare(b.name);
          });
      },
      onError: async (error) => {
        await showToast({
          style: Toast.Style.Failure,
          title: `Failed to load items from ${vaultName}`,
          message: error.message,
        });
      },
    },
  );
}

/**
 * Fetch items from a single vault (for parallel fetching in useAllItems)
 */
async function fetchItemsFromVault(
  cliPath: string,
  vaultName: string,
): Promise<PassItem[]> {
  const { stdout } = await execFileAsync(
    cliPath,
    ["item", "list", vaultName, "--output", "json"],
    {
      timeout: 60000,
      maxBuffer: 50 * 1024 * 1024,
    },
  );
  const response = JSON.parse(stdout.trim()) as CLIItemsResponse;
  return response.items
    .filter((item) => item.state === "Active")
    .map((item) => parseCliItem(item, vaultName));
}

/**
 * Hook to fetch all items across all vaults with parallel fetching
 * Uses useCachedPromise because it orchestrates multiple CLI calls
 */
export function useAllItems() {
  const cliPath = getCliPath();

  return useCachedPromise(
    async () => {
      // First get all vaults
      const { stdout } = await execFileAsync(
        cliPath,
        ["vault", "list", "--output", "json"],
        {
          timeout: 60000,
          maxBuffer: 50 * 1024 * 1024,
        },
      );
      const vaultsResponse = JSON.parse(stdout.trim()) as CLIVaultsResponse;
      const vaults = vaultsResponse.vaults.map(parseCliVault);

      // Fetch items from all vaults in parallel
      const itemPromises = vaults.map((vault) =>
        fetchItemsFromVault(cliPath, vault.name).catch((error) => {
          console.error(
            `Error fetching items from vault "${vault.name}":`,
            error,
          );
          return [] as PassItem[];
        }),
      );

      const itemArrays = await Promise.all(itemPromises);

      // Flatten and sort: favorites first, then alphabetically
      return itemArrays.flat().sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
    },
    [],
    {
      keepPreviousData: true,
      onError: async (error) => {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load items",
          message: error.message,
        });
      },
    },
  );
}
