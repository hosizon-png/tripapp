import { View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/lib/constants";

interface Props extends ViewProps {
  intensity?: number;
  noBorder?: boolean;
  children: React.ReactNode;
}

export function GlassPanel({ intensity = 70, noBorder, children, style, ...props }: Props) {
  const colors = Colors.light;

  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[
        {
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.glass,
          ...(!noBorder && { borderWidth: 0.5, borderColor: colors.glassBorder }),
        },
        style as any,
      ]}
      {...(props as any)}
    >
      {children}
    </BlurView>
  );
}
