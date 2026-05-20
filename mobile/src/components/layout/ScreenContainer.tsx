import { View, ScrollView, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/lib/constants";

interface Props extends ViewProps {
  scrollable?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
}

export function ScreenContainer({ scrollable, noPadding, children, style, ...props }: Props) {
  const bg = Colors.light.background;

  const content = (
    <View style={[{ flex: 1 }, !noPadding && { paddingHorizontal: 20 }, style]} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
