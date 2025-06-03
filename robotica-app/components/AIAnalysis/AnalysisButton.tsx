import React, { useRef, useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Easing,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/hooks/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const { theme } = useThemeContext();
  const colors = Colors[theme];

  // Estados y animaciones
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(-80)).current;
  const scan2Anim = useRef(new Animated.Value(-120)).current;
  const scan3Anim = useRef(new Animated.Value(-60)).current;
  const scan4Anim = useRef(new Animated.Value(-40)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const transitionAnim = useRef(new Animated.Value(1)).current;

  // Efecto para detectar cuando el procesamiento termina y crear una transición suave
  useEffect(() => {
    if (!processing && isCompleting) {
      // Animar la finalización del progreso (de donde esté actualmente hasta 100%)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 600, // Más tiempo para apreciar la finalización
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // Actualizar el valor del progreso a 100% para la visualización
      setAnalysisProgress(100);

      // Desvanecer gradualmente todos los elementos animados
      Animated.timing(transitionAnim, {
        toValue: 0,
        duration: 1000, // 1 segundo de transición
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        delay: 600, // Comenzar a desvanecer después de que llegue al 100%
      }).start(() => {
        // Resetear estado de finalización cuando termine la animación
        setIsCompleting(false);
      });
    }
  }, [processing, isCompleting]);

  // Efecto para simular progreso con varios efectos visuales
  useEffect(() => {
    if (processing) {
      // Reiniciar los estados
      setIsCompleting(false);
      transitionAnim.setValue(1);

      // Reiniciar las animaciones
      progressAnim.setValue(0);
      scanAnim.setValue(-80);
      scan2Anim.setValue(-120);
      scan3Anim.setValue(-60);
      scan4Anim.setValue(-40);
      glowAnim.setValue(0);
      backgroundAnim.setValue(0);
      borderAnim.setValue(0);

      // Animación de escaneo principal - más rápida
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: SCREEN_WIDTH,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 } // Infinitas repeticiones
      ).start();

      // Segunda línea de escaneo - más lenta para efecto de ondas consecutivas
      Animated.loop(
        Animated.timing(scan2Anim, {
          toValue: SCREEN_WIDTH,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 }
      ).start();

      // Tercera línea de escaneo - muy rápida para efecto dinámico
      Animated.loop(
        Animated.timing(scan3Anim, {
          toValue: SCREEN_WIDTH,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 }
      ).start();

      // Cuarta línea de escaneo - velocidad media para crear patrones complejos
      Animated.loop(
        Animated.timing(scan4Anim, {
          toValue: SCREEN_WIDTH,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 }
      ).start();

      // Animación de brillo/resplandor que pulsa con más intensidad
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();

      // Animación del borde que pulsa
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(borderAnim, {
            toValue: 0.5,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
        { iterations: -1 }
      ).start();

      // Animación del fondo que cambia su intensidad
      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
        { iterations: -1 }
      ).start();

      // Animación de pulso del contenido con más énfasis
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();

      // Animación de progreso que avanza realísticamente
      // Sistema para simular progreso con velocidad variable (más lento hacia el final)
      setAnalysisProgress(0);
      const simulateProgress = () => {
        setAnalysisProgress((prev) => {
          let increment;

          // La velocidad varía según el progreso actual
          if (prev < 30) increment = 0.8; // Inicio rápido
          else if (prev < 50) increment = 0.5; // Velocidad media
          else if (prev < 80) increment = 0.3; // Se ralentiza
          else if (prev < 95) increment = 0.1; // Muy lento al final
          else increment = 0.05; // Casi detenido

          const nextProgress = Math.min(99, prev + increment);

          // Actualizar la animación
          Animated.timing(progressAnim, {
            toValue: nextProgress / 100,
            duration: 250,
            useNativeDriver: false,
          }).start();

          return nextProgress;
        });
      };

      // Iniciar simulación de progreso
      const progressInterval = setInterval(simulateProgress, 250);

      return () => {
        clearInterval(progressInterval);

        // Al desmontar el componente, preparar la transición de finalización
        setIsCompleting(true);

        // Detener las animaciones en bucle
        scanAnim.stopAnimation();
        scan2Anim.stopAnimation();
        scan3Anim.stopAnimation();
        scan4Anim.stopAnimation();
        glowAnim.stopAnimation();
        pulseAnim.stopAnimation();
        backgroundAnim.stopAnimation();
        borderAnim.stopAnimation();
      };
    } else if (!processing && !isCompleting) {
      // Si no está procesando y no está en fase de finalización, resetear todo
      progressAnim.setValue(0);
      setAnalysisProgress(0);
      transitionAnim.setValue(1);
    }
  }, [processing]);

  // Colores dinámicos para la animación
  const primaryColor = processing ? colors.secondary : colors.accent;
  const secondaryColor = processing ? `${colors.secondary}CC` : colors.tint;
  const highlightColor = processing ? colors.secondary : colors.accent;

  // Color verde para el borde
  const borderGreenColor = "#4CAF50";

  // Interpolación para el color de fondo animado
  const animatedBackgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#666666", "#777777", "#555555"],
  });

  // Animación del borde
  const borderWidth = borderAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [2, 3.5],
  });

  const borderColor = borderAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [borderGreenColor + "DD", borderGreenColor],
  });

  // Determinar si mostrar elementos de procesamiento (durante procesamiento o finalización)
  const showProcessingElements = processing || isCompleting;

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
        disabled={isDisabled || isCompleting}
        style={styles.touchableArea}
        activeOpacity={0.8}
      >
        <View style={styles.gradientContainer}>
          {/* Fondo base con gradiente */}
          {showProcessingElements ? (
            // Fondo gris con borde verde cuando está procesando
            <Animated.View
              style={[
                styles.animatedBackground,
                {
                  backgroundColor: animatedBackgroundColor,
                  borderWidth: borderWidth,
                  borderColor: borderColor,
                  opacity: transitionAnim, // Hacer que se desvanezca en la transición
                },
              ]}
            />
          ) : (
            // Fondo estático cuando no está procesando
            <LinearGradient
              colors={[primaryColor, secondaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          )}

          {/* Capa de progreso animado para efecto futurista */}
          {showProcessingElements && (
            <>
              {/* Barra de progreso que crece desde la izquierda */}
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: `${borderGreenColor}50`,
                    opacity: transitionAnim, // Desvanecer en la transición
                  },
                ]}
              />

              {/* Capa de fondo pulsante */}
              <Animated.View
                style={[
                  styles.pulsingBackground,
                  {
                    opacity: Animated.multiply(
                      glowAnim.interpolate({
                        inputRange: [0.2, 1],
                        outputRange: [0.1, 0.3],
                      }),
                      transitionAnim // Multiplicar por la animación de transición
                    ),
                  },
                ]}
              >
                <LinearGradient
                  colors={["transparent", borderGreenColor, "transparent"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.pulsingGradient}
                />
              </Animated.View>

              {/* Líneas de escaneo múltiples */}
              <Animated.View
                style={[
                  styles.scanLine4,
                  {
                    transform: [{ translateX: scan4Anim }],
                    backgroundColor: "rgba(76,175,80,0.2)",
                    opacity: transitionAnim,
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.scanLine3,
                  {
                    transform: [{ translateX: scan3Anim }],
                    backgroundColor: "rgba(76,175,80,0.3)",
                    opacity: transitionAnim,
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.scanLine2,
                  {
                    transform: [{ translateX: scan2Anim }],
                    backgroundColor: "rgba(76,175,80,0.4)",
                    borderLeftWidth: 15,
                    borderRightWidth: 15,
                    borderLeftColor: "rgba(76,175,80,0)",
                    borderRightColor: "rgba(76,175,80,0)",
                    opacity: transitionAnim,
                  },
                ]}
              />

              {/* Efecto de escaneo principal */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateX: scanAnim }],
                    backgroundColor: "rgba(76,175,80,0.8)",
                    borderLeftWidth: 10,
                    borderRightWidth: 10,
                    borderLeftColor: "rgba(76,175,80,0)",
                    borderRightColor: "rgba(76,175,80,0)",
                    opacity: transitionAnim,
                  },
                ]}
              />

              {/* Efecto de brillo pulsante general */}
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    opacity: Animated.multiply(glowAnim, transitionAnim),
                    backgroundColor: borderGreenColor,
                  },
                ]}
              />

              {/* Indicador de porcentaje */}
              <Animated.View
                style={[
                  styles.progressTextContainer,
                  { opacity: transitionAnim },
                ]}
              >
                <Text style={styles.progressText}>
                  {Math.round(analysisProgress)}%
                </Text>
              </Animated.View>
            </>
          )}

          {/* Contenido del botón (texto e ícono) */}
          <Animated.View
            style={[
              styles.buttonContent,
              showProcessingElements && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {showProcessingElements ? (
              <MaterialCommunityIcons
                name="robot-outline"
                size={28}
                color="#fff"
              />
            ) : (
              <MaterialCommunityIcons name="brain" size={28} color="#fff" />
            )}
            <Text style={styles.buttonText}>
              {showProcessingElements
                ? "Analizando datos..."
                : "Analizar con Inteligencia Artificial"}
            </Text>
          </Animated.View>
        </View>
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
  gradientContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  animatedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    textAlign: "center",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  scanLine: {
    position: "absolute",
    width: 50,
    height: "100%",
    opacity: 0.9,
    zIndex: 4,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: "rgba(255,255,255,0)",
    borderRightColor: "rgba(255,255,255,0)",
  },
  scanLine2: {
    position: "absolute",
    width: 70,
    height: "100%",
    opacity: 0.6,
    zIndex: 3,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderLeftColor: "rgba(255,255,255,0)",
    borderRightColor: "rgba(255,255,255,0)",
  },
  scanLine3: {
    position: "absolute",
    width: 40,
    height: "100%",
    opacity: 0.4,
    zIndex: 2,
  },
  scanLine4: {
    position: "absolute",
    width: 80,
    height: "100%",
    opacity: 0.3,
    zIndex: 2,
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    zIndex: 1,
  },
  pulsingBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pulsingGradient: {
    width: "100%",
    height: "100%",
  },
  progressTextContainer: {
    position: "absolute",
    bottom: 4,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 4,
  },
  progressText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default AnalysisButton;
