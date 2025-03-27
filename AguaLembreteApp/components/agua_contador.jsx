import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";

export default function AguaContador({ copos, setCopos, dailyGoal }) {
  const { theme } = useTheme();

  const getProgressColor = () => {
    const progress = copos / dailyGoal;
    if (progress >= 1) return "#4CAF50";
    if (progress >= 0.5) return "#FFC107";
    return "#FF5722";
  };

  const adicionar = async () => {
    const dtAtual = new Date().toLocaleDateString("pt-BR");
    setCopos(copos + 1);
    try {
      const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
      const lista = historico ? JSON.parse(historico) : [];
      const coposHoje = lista.find((entry) => entry.date === dtAtual);
      if (coposHoje) {
        coposHoje.count += 1;
      } else {
        lista.push({ date: dtAtual, count: 1 });
      }
      await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(lista));
    } catch (e) {
      console.error("Erro ao salvar histórico:", e);
    }
  };

  return (
    <View
      style={[styles.counterCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.counterText, { color: theme.primaryDark }]}>
          Copos Hoje
        </Text>
        <Text style={[styles.goalText, { color: theme.secondaryText }]}>
          Meta: {copos}/{dailyGoal} copos
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((copos / dailyGoal) * 100, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Button
          title="Bebi um copo! 💧"
          onPress={adicionar}
          color={theme.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counterCard: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  counterText: {
    fontSize: 24,
    fontWeight: "600",
  },
  goalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
});
