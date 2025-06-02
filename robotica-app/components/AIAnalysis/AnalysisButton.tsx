import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

interface AnalysisButtonProps {
  processing: boolean;
  buttonScale: Animated.Value;
  isDisabled: boolean;
  onPress: () => void;
}

const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  processing,
  buttonScale,
  isDisabled,
  onPress,
}) => {
  const { colorScheme } = useColorScheme();
  // Asegurar que solo sea 'light' o 'dark' para indexar Colors
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  // Animación de rotación para el ícono mientras procesa
  const spinValue = new Animated.Value(0);

  // Iniciar animación de rotación
  React.useEffect(() => {
    if (processing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [processing, spinValue]);

  // Mapear el valor de rotación a grados
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          transform: [{ scale: buttonScale }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={styles.touchableArea}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            processing
              ? [colors.secondary, `${colors.secondary}CC`]
              : [colors.accent, colors.tint]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.buttonContent}>
            {processing ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={28}
                  color="#fff"
                />
              </Animated.View>
            ) : (
              <MaterialCommunityIcons name="brain" size={28} color="#fff" />
            )}
            <Text style={styles.buttonText}>
              {processing
                ? "Analizando datos..."
                : "Analizar con Inteligencia Artificial"}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  touchableArea: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    textAlign: "center",
  },
});

export default AnalysisButton;
