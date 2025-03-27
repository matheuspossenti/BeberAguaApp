import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import { setupNotifications, updateNotifications } from "../utils/notifications";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";
const SETTINGS_PATH = "beberagua:notificationSettings";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [copos, setCopos] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        carregar(),
        setupNotifications(),
        updateNotifications(),
        loadDailyGoal()
      ]);
    };
    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const recarregarAoVoltar = async () => {
        await Promise.all([carregar(), loadDailyGoal()]);
      };
      recarregarAoVoltar();
    }, []) // Add SETTINGS_PATH to dependencies if needed
  );

  const loadDailyGoal = async () => {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_PATH);
      console.log("Loading settings:", settings);
      if (settings) {
        const { dailyGoal: savedGoal } = JSON.parse(settings);
        console.log("Setting new daily goal:", savedGoal);
        setDailyGoal(savedGoal || 8);
      }
    } catch (e) {
      console.error("Erro ao carregar meta diária:", e);
    }
  };

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
});
