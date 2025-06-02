import React, { useEffect, useRef, useState } from "react";
import { Text, Animated, Easing } from "react-native";

interface AnimatedLoadingTextProps {
  text: string;
  color?: string;
}

const AnimatedLoadingText: React.FC<AnimatedLoadingTextProps> = ({
  text,
  color = "#0057A3",
}) => {
  const dotAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de puntos más fluida
    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 3,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Efecto de pulso para el texto
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Suscripción para actualizar los puntos
    const listener = dotAnim.addListener(({ value }) => {
      // Asegurarse de que value sea un número antes de usar Math.floor
      if (typeof value === "number") {
        setDots(".".repeat(Math.floor(value)));
      } else {
        setDots("...");
      }
    });

    return () => {
      // Limpieza
      dotAnim.removeListener(listener);
      dotAnim.stopAnimation();
      fadeAnim.stopAnimation();
    };
  }, [dotAnim, fadeAnim]);

  return (
    <Animated.Text style={{ color, fontSize: 14, opacity: fadeAnim }}>
      {text}
      <Text>{dots}</Text>
    </Animated.Text>
  );
};

export default AnimatedLoadingText;
