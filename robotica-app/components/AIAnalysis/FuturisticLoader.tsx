import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

interface FuturisticLoaderProps {
  size?: number;
  color?: string;
}

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({
  size = 40,
  color = "#0057A3",
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de rotación continua - más suave
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000, // Más lento para una rotación más suave
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animación de pulso - más suave
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Efecto de brillo
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    return () => {
      // Detener animaciones al desmontar
      spinAnim.stopAnimation();
      pulseAnim.stopAnimation();
      shimmerAnim.stopAnimation();
    };
  }, [spinAnim, pulseAnim, shimmerAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Efecto de brillo
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.2, 0],
  });

  // Asegurar que el tamaño sea un número
  const sizeValue = typeof size === "number" ? size : 40;

  return (
    <View style={styles.container}>
      {/* Brillo animado */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: sizeValue * 1.5,
            height: sizeValue * 1.5,
            borderRadius: sizeValue * 1.5,
            backgroundColor: color,
            opacity: shimmerOpacity,
          },
        ]}
      />

      {/* Anillo exterior */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: sizeValue,
            height: sizeValue,
            borderColor: color,
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      />

      {/* Anillo interior */}
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: sizeValue * 0.7,
            height: sizeValue * 0.7,
            borderColor: color,
            transform: [
              {
                rotate: spinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["360deg", "0deg"],
                }),
              },
            ],
          },
        ]}
      />

      {/* Centro */}
      <View
        style={[
          styles.center,
          {
            width: sizeValue * 0.4,
            height: sizeValue * 0.4,
            backgroundColor: color,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pulse,
            {
              width: sizeValue * 0.6,
              height: sizeValue * 0.6,
              backgroundColor: color,
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.3, 0],
              }),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      </View>
    </View>
  );
};

// Estilos para los loaders futuristas mejorados
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 60,
    height: 60,
  },
  shimmer: {
    position: "absolute",
    opacity: 0.2,
  },
  outerRing: {
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dotted",
    position: "absolute",
  },
  innerRing: {
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    position: "absolute",
  },
  center: {
    borderRadius: 100,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  pulse: {
    borderRadius: 100,
    position: "absolute",
    alignSelf: "center",
  },
});

export default FuturisticLoader;
