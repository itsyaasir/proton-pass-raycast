import { List, Icon, Action, ActionPanel } from "@raycast/api";
import { useMemo } from "react";
import { useCachedState } from "@raycast/utils";
import {
  PassItem,
  ItemCategory,
  getCategoryIcon,
  isLoginItem,
  hasTotp,
} from "../types";
import { getPrimaryUrl } from "../utils";
import { useAllItems, useItemsInVault } from "../hooks";
import { ItemActions } from "./ItemActions";
import { ItemDetail } from "./ItemDetail";
import { Categories } from "./Categories";

interface ItemsProps {
  vaultName?: string;
}

export function Items({ vaultName }: ItemsProps) {
  // Use the appropriate hook based on whether we're filtering by vault
  const allItemsResult = useAllItems();
  const vaultItemsResult = useItemsInVault(vaultName || "");

  // Select the right result based on whether vaultName is provided
  const {
    data: items = [],
    isLoading,
    error,
  } = vaultName ? vaultItemsResult : allItemsResult;

  const [selectedCategory, setSelectedCategory] = useCachedState<
    ItemCategory | "all"
  >("selected-category", "all");

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return items;
    }
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Sort items: favorites first, then alphabetically
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredItems]);

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
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search items..."
      searchBarAccessory={
        <Categories
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      }
    >
      {sortedItems.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No Items Found"
          description={
            selectedCategory === "all"
              ? "No items in this vault"
              : `No ${selectedCategory} items found`
          }
          icon={Icon.MagnifyingGlass}
        />
      ) : (
        sortedItems.map((item) => (
          <ItemListItem key={`${item.shareId}-${item.id}`} item={item} />
        ))
      )}
    </List>
  );
}

interface ItemListItemProps {
  item: PassItem;
}

function ItemListItem({ item }: ItemListItemProps) {
  const icon = getCategoryIcon(item.category);
  const subtitle = getItemSubtitle(item);
  const accessories = getItemAccessories(item);

  return (
    <List.Item
      id={`${item.shareId}-${item.id}`}
      title={item.name}
      subtitle={subtitle}
      icon={icon}
      accessories={accessories}
      keywords={getItemKeywords(item)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Push
              title="View Details"
              icon={Icon.Eye}
              target={<ItemDetail item={item} />}
            />
          </ActionPanel.Section>
          <ItemActions item={item} />
        </ActionPanel>
      }
    />
  );
}

function getItemSubtitle(item: PassItem): string {
  switch (item.category) {
    case "Login":
      return item.username || item.email || "";
    case "Alias":
      return item.aliasEmail || "";
    default:
      return "";
  }
}

function getItemAccessories(item: PassItem): List.Item.Accessory[] {
  const accessories: List.Item.Accessory[] = [];

  // Favorite indicator
  if (item.favorite) {
    accessories.push({ icon: Icon.Star, tooltip: "Favorite" });
  }

  // TOTP indicator for login items
  if (hasTotp(item)) {
    accessories.push({ icon: Icon.Clock, tooltip: "Has TOTP" });
  }

  // URL indicator for login items
  if (isLoginItem(item)) {
    const url = getPrimaryUrl(item.urls);
    if (url) {
      try {
        const domain = new URL(url).hostname;
        accessories.push({ text: domain, tooltip: url });
      } catch {
        // URL might not be valid, skip
      }
    }
  }

  // Vault name (only show if not browsing a specific vault)
  if (item.vaultName) {
    accessories.push({ tag: item.vaultName });
  }

  return accessories;
}

function getItemKeywords(item: PassItem): string[] {
  const keywords: string[] = [item.category, item.name];

  if (isLoginItem(item)) {
    if (item.username) keywords.push(item.username);
    if (item.email) keywords.push(item.email);
    if (item.urls) keywords.push(...item.urls);
  }

  if (item.category === "Alias" && item.aliasEmail) {
    keywords.push(item.aliasEmail);
  }

  if (item.vaultName) {
    keywords.push(item.vaultName);
  }

  return keywords;
}
