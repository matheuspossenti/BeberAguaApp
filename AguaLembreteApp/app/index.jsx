import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import {
  setupNotifications,
  updateNotifications,
} from "../utils/notifications";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";
const SETTINGS_PATH = "beberagua:notificationSettings";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [copos, setCopos] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);

  const loadDailyGoal = async () => {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_PATH);
      if (settings) {
        const { dailyGoal: savedGoal } = JSON.parse(settings);
        if (savedGoal) {
          setDailyGoal(savedGoal);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar meta diária:", e);
    }
  };

  const carregar = async () => {
    try {
      const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
      if (historico) {
        const lista = JSON.parse(historico);
        const hoje = new Date().toLocaleDateString("pt-BR");
        const coposHoje = lista.find((entry) => entry.date === hoje);
        setCopos(coposHoje ? coposHoje.count : 0);
      } else {
        setCopos(0);
      }
    } catch (e) {
      console.error("Erro ao carregar copos:", e);
    }
  };

  const reiniciarDia = async () => {
    Alert.alert(
      "Reiniciar Dia",
      "Tem certeza que deseja zerar o contador de hoje?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reiniciar",
          onPress: async () => {
            try {
              const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
              if (historico) {
                const lista = JSON.parse(historico);
                const hoje = new Date().toLocaleDateString("pt-BR");
                const novaLista = lista.filter((entry) => entry.date !== hoje);
                await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(novaLista));
                setCopos(0);
              }
            } catch (e) {
              console.error("Erro ao reiniciar dia:", e);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Initial setup
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        setupNotifications(),
        updateNotifications(),
        loadDailyGoal(),
        carregar(),
      ]);
    };
    initialize();
  }, []);

  // Update when returning to screen
  useFocusEffect(
    useCallback(() => {
      const recarregarAoVoltar = async () => {
        await Promise.all([carregar(), loadDailyGoal()]);
      };
      recarregarAoVoltar();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primaryDark }]}>
        Lembrete de Água
      </Text>
      <AguaContador 
        copos={copos} 
        setCopos={setCopos} 
        dailyGoal={dailyGoal}
      />
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: theme.cardBackground }]}
        onPress={reiniciarDia}
      >
        <Text style={[styles.resetButtonText, { color: theme.error }]}>
          Reiniciar Dia 🔄
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
