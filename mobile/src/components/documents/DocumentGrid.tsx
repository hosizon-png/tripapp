import { View, Text, Pressable, Alert } from "react-native";
import { File, FileText, FileImage, Trash2 } from "lucide-react-native";
import { Colors } from "@/lib/constants";

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  category: string;
  createdAt: string;
}

interface Props {
  documents: Document[];
  onDelete?: (id: string) => void;
  onUpload: () => void;
}

const categoryLabels: Record<string, string> = {
  ticket: "机票",
  passport: "护照",
  visa: "签证",
  insurance: "保险",
  other: "其他",
};

function isImage(type: string): boolean {
  return type.startsWith("image/");
}

export function DocumentGrid({ documents, onDelete, onUpload }: Props) {
  const colors = Colors.light;

  return (
    <View style={{ padding: 16 }}>
      {/* Upload button */}
      <Pressable
        onPress={onUpload}
        style={{
          borderWidth: 2,
          borderColor: colors.separator,
          borderStyle: "dashed",
          borderRadius: 14,
          padding: 24,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 8 }}>📎</Text>
        <Text style={{ fontSize: 15, fontWeight: "500", color: colors.tint }}>
          上传文件
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          支持图片、PDF (最大 10MB)
        </Text>
      </Pressable>

      {/* Document list */}
      {documents.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            还没有上传任何文件
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {documents.map((doc) => (
            <View
              key={doc.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: colors.separator,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isImage(doc.fileType) ? (
                  <FileImage size={22} color={colors.tint} />
                ) : (
                  <FileText size={22} color={colors.tint} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{ fontSize: 15, color: colors.textPrimary, fontWeight: "500" }}
                  numberOfLines={1}
                >
                  {doc.name}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {categoryLabels[doc.category] || doc.category}
                </Text>
              </View>
              {onDelete && (
                <Pressable
                  onPress={() => {
                    Alert.alert("删除", "确定删除这个文件吗？", [
                      { text: "取消", style: "cancel" },
                      { text: "删除", style: "destructive", onPress: () => onDelete(doc.id) },
                    ]);
                  }}
                  style={{ padding: 8 }}
                >
                  <Trash2 size={16} color="#FF3B30" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
