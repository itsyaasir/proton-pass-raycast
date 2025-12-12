import { List, Icon, Action, ActionPanel } from "@raycast/api";
import { Vault } from "../types";
import { useVaults } from "../hooks";
import { Items } from "./Items";

export function Vaults() {
  const { data: vaults = [], isLoading, error } = useVaults();

  if (error) {
    return (
      <List>
        <List.EmptyView
          title="Error"
          description={error.message}
          icon={Icon.ExclamationMark}
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search vaults...">
      {vaults.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No Vaults Found"
          description="No vaults available"
          icon={Icon.Folder}
        />
      ) : (
        vaults.map((vault) => (
          <VaultListItem key={vault.shareId} vault={vault} />
        ))
      )}
    </List>
  );
}

interface VaultListItemProps {
  vault: Vault;
}

function VaultListItem({ vault }: VaultListItemProps) {
  return (
    <List.Item
      id={vault.shareId}
      title={vault.name}
      icon={Icon.Folder}
      actions={
        <ActionPanel>
          <Action.Push
            title="Browse Items"
            icon={Icon.List}
            target={<Items vaultName={vault.name} />}
          />
          <Action.CopyToClipboard
            title="Copy Vault Name"
            content={vault.name}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.CopyToClipboard
            title="Copy Share ID"
            content={vault.shareId}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
