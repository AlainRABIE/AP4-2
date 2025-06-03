import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { TextInput } from "react-native-paper";
import { addMeal, MealData } from "../../services/calorie";

export default function AddMidi() {
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const paramsProcessedRef = useRef(false);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (paramsProcessedRef.current) return;

    if (params.date && typeof params.date === "string") {
      try {
        const dateFromParam = new Date(params.date);
        if (!isNaN(dateFromParam.getTime())) {
          setSelectedDate(dateFromParam);
        }
      } catch (error) {
        console.error("Erreur lors du parsing de la date:", error);
      }
    }

    paramsProcessedRef.current = true;
  }, [params]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleConfirm = async () => {
    if (!mealName || !calories) {
      Alert.alert("Erreur", "Veuillez entrer un aliment et le nombre de calories.");
      return;
    }

    try {
      setLoading(true);

      const mealData: MealData = {
        nom: mealName,
        calories: parseInt(calories),
        Repas: "Déjeuner",
        date: selectedDate,
      };

      await addMeal(mealData);
      Alert.alert("Succès", "Repas ajouté avec succès !");
      router.back();
    } catch (error) {
      console.error("Erreur lors de l'ajout du repas :", error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Impossible d'ajouter le repas."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter un aliment</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.mealInfoContainer}>
            <View style={styles.mealTypeWrapper}>
              <Ionicons
                name="restaurant"
                size={20}
                color="#fff"
                style={styles.mealTypeIcon}
              />
              <Text style={styles.mealTypeName}>Déjeuner</Text>
            </View>

            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={18} color="#666" />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              mode="outlined"
              label="Nom de l'aliment"
              value={mealName}
              onChangeText={setMealName}
              style={styles.textInput}
              placeholder="Ex: Poulet, Riz, Salade..."
              outlineColor="#dadada"
              activeOutlineColor="#FF6A88"
              left={<TextInput.Icon icon="food" />}
            />

            <TextInput
              mode="outlined"
              label="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="Ex: 450"
              outlineColor="#dadada"
              activeOutlineColor="#FF6A88"
              left={<TextInput.Icon icon="fire" />}
              right={<TextInput.Affix text="kcal" />}
            />
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={styles.confirmButtonText}>Sauvegarder</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  mealInfoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  mealTypeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6A88",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginBottom: 10,
  },
  mealTypeIcon: {
    marginRight: 8,
  },
  mealTypeName: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 50,
    paddingHorizontal: 12,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  formContainer: {
    marginBottom: 25,
  },
  textInput: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  confirmButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});