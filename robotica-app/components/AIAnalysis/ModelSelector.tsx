import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FuturisticLoader from "./FuturisticLoader";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ProgressLoader } from "@/components/AIAnalysis";

interface ModelSelectorProps {
  currentModel: string;
  isChangingModel: boolean;
  isLoadingModels: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  isChangingModel,
  isLoadingModels,
  isDisabled,
  onPress,
}) => {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isLoadingModels || isChangingModel ? (
        <View style={styles.loadingContainer}>
          <ProgressLoader indeterminate height={4} color={colors.tint} />
        </View>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.placeholder }]}>
            Modelo IA
          </Text>
          <Text
            style={[styles.modelName, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentModel || "No seleccionado"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: "center",
    flex: 0.4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  label: {
    fontSize: 10,
    marginBottom: 2,
  },
  modelName: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ModelSelector;
