import { ScrollView, Pressable, Text } from "react-native";

interface Props {
  suggestions: Record<string, string[]>;
  onSelect: (value: string) => void;
}

export function SmartChipBar({ suggestions, onSelect }: Props) {
  const allChips = Object.values(suggestions).flat();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 2, gap: 8, paddingVertical: 4 }}
      style={{ marginTop: 8 }}
    >
      {allChips.map((chip) => (
        <Pressable
          key={chip}
          onPress={() => onSelect(chip)}
          style={({ pressed }) => ({
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: pressed ? "rgba(0,122,255,0.3)" : "rgba(255,255,255,0.12)",
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.2)",
          })}
        >
          <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "600" }}>{chip}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
