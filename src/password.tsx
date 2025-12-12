import {
  List,
  ActionPanel,
  Action,
  Icon,
  showHUD,
  Clipboard,
  closeMainWindow,
  Color,
} from "@raycast/api";
import { useState } from "react";
import {
  generatePassword,
  generatePassphrase,
  getPasswordScore,
} from "./utils";
import { getPreferences } from "./types";

type Mode = "generate-random" | "generate-passphrase" | "check-strength";
type SeparatorType =
  | "hyphens"
  | "spaces"
  | "periods"
  | "commas"
  | "underscores"
  | "numbers"
  | "numbers-and-symbols";

export default function Command() {
  const [mode, setMode] = useState<Mode>("generate-random");

  return (
    <List
      searchBarPlaceholder="Select an action..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Mode"
          value={mode}
          onChange={(value) => setMode(value as Mode)}
        >
          <List.Dropdown.Item
            title="Generate Random Password"
            value="generate-random"
            icon={Icon.Key}
          />
          <List.Dropdown.Item
            title="Generate Passphrase"
            value="generate-passphrase"
            icon={Icon.Text}
          />
          <List.Dropdown.Item
            title="Check Password Strength"
            value="check-strength"
            icon={Icon.Shield}
          />
        </List.Dropdown>
      }
    >
      {mode === "generate-random" && <RandomPasswordSection />}
      {mode === "generate-passphrase" && <PassphraseSection />}
      {mode === "check-strength" && <StrengthCheckerSection />}
    </List>
  );
}

// =================== Random Password Section ===================

function RandomPasswordSection() {
  const [password, setPassword] = useState<string>("");
  const [strength, setStrength] = useState<{
    score: string;
    numeric: number;
  } | null>(null);
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const { closeAfterCopy } = getPreferences();

  const generate = () => {
    const newPassword = generatePassword({
      length,
      uppercase,
      numbers,
      symbols,
    });
    setPassword(newPassword);

    const scoreResult = getPasswordScore(newPassword);
    if (scoreResult) {
      setStrength({
        score: scoreResult.passwordScore,
        numeric: scoreResult.numericScore,
      });
    }
  };

  const copyPassword = async () => {
    if (!password) return;
    await Clipboard.copy(password, { concealed: true });
    await showHUD("Password copied");
    if (closeAfterCopy) await closeMainWindow();
  };

  return (
    <>
      <List.Section title="Options">
        <List.Item
          title="Length"
          subtitle={`${length} characters`}
          icon={Icon.Ruler}
          accessories={[{ text: "← / → to adjust" }]}
          actions={
            <ActionPanel>
              <Action
                title="Increase"
                icon={Icon.Plus}
                onAction={() => setLength(Math.min(64, length + 1))}
              />
              <Action
                title="Decrease"
                icon={Icon.Minus}
                onAction={() => setLength(Math.max(8, length - 1))}
              />
              <Action title="Set to 16" onAction={() => setLength(16)} />
              <Action title="Set to 24" onAction={() => setLength(24)} />
              <Action title="Set to 32" onAction={() => setLength(32)} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Uppercase Letters"
          subtitle="A-Z"
          icon={uppercase ? Icon.CheckCircle : Icon.Circle}
          accessories={[{ tag: uppercase ? "On" : "Off" }]}
          actions={
            <ActionPanel>
              <Action
                title="Toggle"
                onAction={() => setUppercase(!uppercase)}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Numbers"
          subtitle="0-9"
          icon={numbers ? Icon.CheckCircle : Icon.Circle}
          accessories={[{ tag: numbers ? "On" : "Off" }]}
          actions={
            <ActionPanel>
              <Action title="Toggle" onAction={() => setNumbers(!numbers)} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Symbols"
          subtitle="!@#$%..."
          icon={symbols ? Icon.CheckCircle : Icon.Circle}
          accessories={[{ tag: symbols ? "On" : "Off" }]}
          actions={
            <ActionPanel>
              <Action title="Toggle" onAction={() => setSymbols(!symbols)} />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Generate">
        <List.Item
          title="Generate Password"
          icon={Icon.Wand}
          accessories={[{ text: "↵ to generate" }]}
          actions={
            <ActionPanel>
              <Action title="Generate" icon={Icon.Wand} onAction={generate} />
            </ActionPanel>
          }
        />
      </List.Section>

      {password && (
        <List.Section title="Result">
          <List.Item
            title={password}
            icon={Icon.Key}
            accessories={[
              strength
                ? {
                    tag: {
                      value: strength.score,
                      color: getStrengthColor(strength.score),
                    },
                  }
                : {},
              { text: `${password.length} chars` },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Copy Password"
                  icon={Icon.Clipboard}
                  onAction={copyPassword}
                />
                <Action
                  title="Regenerate"
                  icon={Icon.Wand}
                  onAction={generate}
                />
                <Action.Paste title="Paste Password" content={password} />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </>
  );
}

// =================== Passphrase Section ===================

function PassphraseSection() {
  const [passphrase, setPassphrase] = useState<string>("");
  const [strength, setStrength] = useState<{
    score: string;
    numeric: number;
  } | null>(null);
  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState<SeparatorType>("hyphens");
  const [capitalize, setCapitalize] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const { closeAfterCopy } = getPreferences();

  const generate = () => {
    const newPassphrase = generatePassphrase({
      words: wordCount,
      separator,
      capitalize,
      numbers: includeNumbers,
    });
    setPassphrase(newPassphrase);

    const scoreResult = getPasswordScore(newPassphrase);
    if (scoreResult) {
      setStrength({
        score: scoreResult.passwordScore,
        numeric: scoreResult.numericScore,
      });
    }
  };

  const copyPassphrase = async () => {
    if (!passphrase) return;
    await Clipboard.copy(passphrase, { concealed: true });
    await showHUD("Passphrase copied");
    if (closeAfterCopy) await closeMainWindow();
  };

  const separatorLabels: Record<SeparatorType, string> = {
    hyphens: "Hyphens (-)",
    spaces: "Spaces",
    periods: "Periods (.)",
    commas: "Commas (,)",
    underscores: "Underscores (_)",
    numbers: "Numbers",
    "numbers-and-symbols": "Numbers & Symbols",
  };

  const separatorOptions: SeparatorType[] = [
    "hyphens",
    "spaces",
    "periods",
    "commas",
    "underscores",
    "numbers",
    "numbers-and-symbols",
  ];

  return (
    <>
      <List.Section title="Options">
        <List.Item
          title="Word Count"
          subtitle={`${wordCount} words`}
          icon={Icon.Text}
          accessories={[{ text: "← / → to adjust" }]}
          actions={
            <ActionPanel>
              <Action
                title="Increase"
                icon={Icon.Plus}
                onAction={() => setWordCount(Math.min(10, wordCount + 1))}
              />
              <Action
                title="Decrease"
                icon={Icon.Minus}
                onAction={() => setWordCount(Math.max(3, wordCount - 1))}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Separator"
          subtitle={separatorLabels[separator]}
          icon={Icon.Link}
          actions={
            <ActionPanel>
              {separatorOptions.map((sep) => (
                <Action
                  key={sep}
                  title={separatorLabels[sep]}
                  onAction={() => setSeparator(sep)}
                />
              ))}
            </ActionPanel>
          }
        />
        <List.Item
          title="Capitalize Words"
          icon={capitalize ? Icon.CheckCircle : Icon.Circle}
          accessories={[{ tag: capitalize ? "On" : "Off" }]}
          actions={
            <ActionPanel>
              <Action
                title="Toggle"
                onAction={() => setCapitalize(!capitalize)}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Include Numbers"
          icon={includeNumbers ? Icon.CheckCircle : Icon.Circle}
          accessories={[{ tag: includeNumbers ? "On" : "Off" }]}
          actions={
            <ActionPanel>
              <Action
                title="Toggle"
                onAction={() => setIncludeNumbers(!includeNumbers)}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Generate">
        <List.Item
          title="Generate Passphrase"
          icon={Icon.Wand}
          accessories={[{ text: "↵ to generate" }]}
          actions={
            <ActionPanel>
              <Action title="Generate" icon={Icon.Wand} onAction={generate} />
            </ActionPanel>
          }
        />
      </List.Section>

      {passphrase && (
        <List.Section title="Result">
          <List.Item
            title={passphrase}
            icon={Icon.Key}
            accessories={[
              strength
                ? {
                    tag: {
                      value: strength.score,
                      color: getStrengthColor(strength.score),
                    },
                  }
                : {},
              { text: `${wordCount} words` },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Copy Passphrase"
                  icon={Icon.Clipboard}
                  onAction={copyPassphrase}
                />
                <Action
                  title="Regenerate"
                  icon={Icon.Wand}
                  onAction={generate}
                />
                <Action.Paste title="Paste Passphrase" content={passphrase} />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </>
  );
}

// =================== Strength Checker Section ===================

function StrengthCheckerSection() {
  const [password, setPassword] = useState<string>("");
  const [result, setResult] = useState<{
    score: string;
    numeric: number;
    penalties: string[];
  } | null>(null);

  const checkStrength = () => {
    if (!password) return;
    const scoreResult = getPasswordScore(password);
    if (scoreResult) {
      setResult({
        score: scoreResult.passwordScore,
        numeric: scoreResult.numericScore,
        penalties: scoreResult.penalties,
      });
    }
  };

  const penaltyLabels: Record<string, string> = {
    ContainsCommonPassword: "Contains common password pattern",
    Consecutive: "Has consecutive characters",
    TooShort: "Too short",
    NoUppercase: "No uppercase letters",
    NoLowercase: "No lowercase letters",
    NoNumbers: "No numbers",
    NoSymbols: "No symbols",
    Repetitive: "Repetitive characters",
    Sequential: "Sequential pattern detected",
  };

  return (
    <>
      <List.Section title="Enter Password">
        <List.Item
          title={password || "Type a password to check..."}
          subtitle={password ? `${password.length} characters` : undefined}
          icon={Icon.Key}
          actions={
            <ActionPanel>
              <Action
                title="Enter Password"
                icon={Icon.Pencil}
                onAction={async () => {
                  const text = await Clipboard.readText();
                  if (text) {
                    setPassword(text);
                    // Auto-check after paste
                    const scoreResult = getPasswordScore(text);
                    if (scoreResult) {
                      setResult({
                        score: scoreResult.passwordScore,
                        numeric: scoreResult.numericScore,
                        penalties: scoreResult.penalties,
                      });
                    }
                  }
                }}
              />
              <Action
                title="Paste from Clipboard"
                icon={Icon.Clipboard}
                shortcut={{ modifiers: ["cmd"], key: "v" }}
                onAction={async () => {
                  const text = await Clipboard.readText();
                  if (text) {
                    setPassword(text);
                    const scoreResult = getPasswordScore(text);
                    if (scoreResult) {
                      setResult({
                        score: scoreResult.passwordScore,
                        numeric: scoreResult.numericScore,
                        penalties: scoreResult.penalties,
                      });
                    }
                  }
                }}
              />
              {password && (
                <Action
                  title="Check Strength"
                  icon={Icon.Shield}
                  onAction={checkStrength}
                />
              )}
              <Action
                title="Clear"
                icon={Icon.Trash}
                onAction={() => {
                  setPassword("");
                  setResult(null);
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      {result && (
        <>
          <List.Section title="Strength Analysis">
            <List.Item
              title="Overall Strength"
              icon={getStrengthIcon(result.score)}
              accessories={[
                {
                  tag: {
                    value: result.score,
                    color: getStrengthColor(result.score),
                  },
                },
                { text: `Score: ${Math.round(result.numeric)}%` },
              ]}
            />
          </List.Section>

          {result.penalties.length > 0 && (
            <List.Section title="Weaknesses Found">
              {result.penalties.map((penalty, index) => (
                <List.Item
                  key={index}
                  title={penaltyLabels[penalty] || penalty}
                  icon={{
                    source: Icon.ExclamationMark,
                    tintColor: Color.Orange,
                  }}
                />
              ))}
            </List.Section>
          )}

          {result.penalties.length === 0 && (
            <List.Section title="Analysis">
              <List.Item
                title="No weaknesses detected"
                icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
              />
            </List.Section>
          )}
        </>
      )}

      <List.Section title="Tips">
        <List.Item title="Use at least 12 characters" icon={Icon.Info} />
        <List.Item
          title="Mix uppercase, lowercase, numbers & symbols"
          icon={Icon.Info}
        />
        <List.Item title="Avoid common words and patterns" icon={Icon.Info} />
      </List.Section>
    </>
  );
}

// =================== Helpers ===================

function getStrengthColor(score: string): Color {
  switch (score) {
    case "Strong":
      return Color.Green;
    case "Good":
      return Color.Blue;
    case "Weak":
      return Color.Orange;
    case "Vulnerable":
      return Color.Red;
    default:
      return Color.SecondaryText;
  }
}

function getStrengthIcon(score: string): Icon {
  switch (score) {
    case "Strong":
      return Icon.Shield;
    case "Good":
      return Icon.CheckCircle;
    case "Weak":
      return Icon.Warning;
    case "Vulnerable":
      return Icon.ExclamationMark;
    default:
      return Icon.QuestionMark;
  }
}
