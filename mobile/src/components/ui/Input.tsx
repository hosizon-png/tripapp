import { TextInput, View, Text, type TextInputProps } from "react-native";
import { Colors } from "@/lib/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, error, prefix, suffix, style, ...props }: InputProps) {
  const colors = Colors.light;

  return (
    <View>
      {label && (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{ backgroundColor: colors.surface }}
      >
        {prefix}
        <TextInput
          className="flex-1 py-4"
          style={{
            fontSize: 17,
            color: colors.textPrimary,
            marginLeft: prefix ? 12 : 0,
            marginRight: suffix ? 12 : 0,
            ...(style as object),
          }}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        {suffix}
      </View>
      {error && (
        <Text style={{ color: "#FF3B30", fontSize: 13, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
