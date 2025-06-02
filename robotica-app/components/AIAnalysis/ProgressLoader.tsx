import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface ProgressLoaderProps {
  progress?: number; // Valor de 0 a 100
  indeterminate?: boolean; // Si es true, muestra animación continua
  color?: string;
  height?: number;
  label?: string;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  progress = 0,
  indeterminate = true,
  color,
  height = 8,
  label,
}) => {
  const { colorScheme } = useColorScheme();
  // Asegurar que solo sea 'light' o 'dark' para indexar Colors
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  const barColor = color || colors.tint;

  // Animaciones
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  // Actualizar la animación cuando cambia el progreso
  useEffect(() => {
    if (!indeterminate) {
      Animated.timing(progressAnim, {
        toValue: progress / 100, // Convertimos a valor de 0 a 1
        duration: 300,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }
  }, [progress, indeterminate]);

  // Animación de pulso para efecto visual
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  // Animación para modo indeterminado (movimiento continuo)
  useEffect(() => {
    if (indeterminate) {
      Animated.loop(
        Animated.timing(indeterminateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
          easing: Easing.linear,
        })
      ).start();
    } else {
      indeterminateAnim.setValue(0);
    }

    return () => {
      indeterminateAnim.stopAnimation();
    };
  }, [indeterminate]);

  // Interpolaciones para el modo indeterminado
  const translateX = indeterminateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-100%", "0%", "100%"],
  });

  const indeterminateWidth = indeterminateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["30%", "60%", "30%"],
  });

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {!indeterminate && (
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      )}

      <View
        style={[styles.trackContainer, { height, borderRadius: height / 2 }]}
      >
        <View
          style={[
            styles.track,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: `${barColor}30`,
            },
          ]}
        />

        {indeterminate ? (
          <Animated.View
            style={[
              styles.indeterminateBar,
              {
                height,
                width: indeterminateWidth,
                borderRadius: height / 2,
                backgroundColor: barColor,
                transform: [{ translateX }],
              },
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.progressBar,
              {
                height,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                borderRadius: height / 2,
                backgroundColor: barColor,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.pulse,
                {
                  height: height * 2.5,
                  width: height * 2.5,
                  borderRadius: height * 1.5,
                  backgroundColor: barColor,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1.0, 1.1],
                    outputRange: [0, 0.15],
                  }),
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 4,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  trackContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  track: {
    width: "100%",
    position: "absolute",
  },
  progressBar: {
    position: "absolute",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  indeterminateBar: {
    position: "absolute",
  },
  pulse: {
    position: "absolute",
    right: -6,
    alignSelf: "center",
  },
});

export default ProgressLoader;
