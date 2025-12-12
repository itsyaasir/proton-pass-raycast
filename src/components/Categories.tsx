import { List, Icon } from "@raycast/api";
import {
  ItemCategory,
  getCategoryDisplayName,
  getCategoryIcon,
} from "../types";

interface CategoriesProps {
  selected: ItemCategory | "all";
  onSelect: (category: ItemCategory | "all") => void;
}

export function Categories({ selected, onSelect }: CategoriesProps) {
  const categories: ItemCategory[] = [
    "Login",
    "Alias",
    "Note",
    "CreditCard",
    "Identity",
    "WiFi",
    "SSHKey",
  ];

  return (
    <List.Dropdown
      tooltip="Filter by Category"
      value={selected}
      onChange={(value) => onSelect(value as ItemCategory | "all")}
    >
      <List.Dropdown.Item
        title="All Items"
        value="all"
        icon={Icon.AppWindowGrid3x3}
      />
      <List.Dropdown.Section title="Categories">
        {categories.map((category) => (
          <List.Dropdown.Item
            key={category}
            title={getCategoryDisplayName(category)}
            value={category}
            icon={getCategoryIcon(category)}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
