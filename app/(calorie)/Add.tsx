import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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


import { takePhoto, pickImage, addMeal, MealData } from "../../services/calorie";

// Types pour Open Food Facts
interface FoodSuggestion {
  product_name: string;
  calories?: number;
  image_url?: string;
  source?: string;
}
import { searchAllFoodAPIs } from "../../services/foodSearchAggregator";

export default function AddMeal() {

  // Hooks principaux du composant
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState("Petit-déjeuner");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const paramsProcessedRef = useRef(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Pour la recherche d'aliments (Open Food Facts)
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoodSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    const timeout = setTimeout(() => {
      searchAllFoodAPIs(search)
        .then((data) => {
          setResults(data);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // Quand on sélectionne un aliment de la liste
  const handleSelectFood = (item: FoodSuggestion) => {
    setMealName(item.product_name);
    if (item.calories) {
      setCalories(Math.round(item.calories).toString());
    }
    setResults([]);
    setSearch(item.product_name);
    setShowResults(false);
  };

  useEffect(() => {
    if (paramsProcessedRef.current) return;

    if (params.mealType && typeof params.mealType === "string") {
      setMealType(params.mealType);
    }

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
      Alert.alert(
        "Attention",
        "Veuillez entrer un aliment et le nombre de calories."
      );
      return;
    }

    try {
      setLoading(true);
      
      const mealData: MealData = {
        nom: mealName,
        calories: parseInt(calories),
        Repas: mealType,
        urlPhoto: photo || "",
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

  const handleTakePhoto = async () => {
    try {
      const photoUri = await takePhoto();
      if (photoUri) {
        setPhoto(photoUri);
      }
    } catch (error) {
      Alert.alert(
        "Permission refusée",
        error instanceof Error ? error.message : "Vous devez autoriser l'accès à la caméra."
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const photoUri = await pickImage();
      if (photoUri) {
        setPhoto(photoUri);
      }
    } catch (error) {
      Alert.alert(
        "Permission refusée",
        error instanceof Error ? error.message : "Vous devez autoriser l'accès à la galerie."
      );
    }
  };

  const removePhoto = () => {
    setPhoto(null);
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
                name={
                  mealType === "Petit-déjeuner"
                    ? "sunny"
                    : mealType === "Déjeuner"
                    ? "restaurant"
                    : mealType === "Dîner"
                    ? "moon"
                    : "ice-cream"
                }
                size={20}
                color="#fff"
                style={styles.mealTypeIcon}
              />
              <Text style={styles.mealTypeName}>{mealType}</Text>
            </View>

            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={18} color="#666" />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={{ position: 'relative', marginBottom: 15 }}>
              <TextInput
                mode="outlined"
                label="Rechercher un aliment"
                value={search}
                onChangeText={text => {
                  setSearch(text);
                  setShowResults(true);
                }}
                style={styles.textInput}
                placeholder="Ex: Pomme, Yaourt, Pain..."
                outlineColor="#dadada"
                activeOutlineColor="#FF6A88"
                left={<TextInput.Icon icon="magnify" />}
                onFocus={() => setShowResults(true)}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {showResults && (searching || results.length > 0) && (
                <View style={styles.suggestionBox}>
                  {searching && (
                    <Text style={styles.suggestionLoading}>Recherche...</Text>
                  )}
                  {!searching && results.length === 0 && (
                    <Text style={styles.suggestionEmpty}>Aucun résultat</Text>
                  )}
                  {!searching && results.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectFood(item)}
                    >
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.suggestionImage} />
                      ) : (
                        <Ionicons name="fast-food" size={24} color="#FF6A88" style={{ marginRight: 8 }} />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionName}>{item.product_name}</Text>
                        {item.calories && (
                          <Text style={styles.suggestionKcal}>
                            {item.calories} kcal / 100g
                          </Text>
                        )}
                        {item.source && (
                          <Text style={{ color: '#aaa', fontSize: 10 }}>Source: {item.source}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TextInput
              mode="outlined"
              label="Nom de l'aliment"
              value={mealName}
              onChangeText={setMealName}
              style={styles.textInput}
              placeholder="Ex: Pomme, Yaourt, Pain..."
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
              placeholder="Ex: 250"
              outlineColor="#dadada"
              activeOutlineColor="#FF6A88"
              left={<TextInput.Icon icon="fire" />}
              right={<TextInput.Affix text="kcal" />}
            />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Photo de l'aliment</Text>

            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoButton, styles.cameraButton]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.photoButtonText}>Appareil photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoButton, styles.galleryButton]}
                onPress={handlePickImage}
              >
                <Ionicons name="images" size={24} color="#fff" />
                <Text style={styles.photoButtonText}>Galerie</Text>
              </TouchableOpacity>
            </View>

            {photo && (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={removePhoto}
                >
                  <Ionicons name="close-circle" size={28} color="#FF6A88" />
                </TouchableOpacity>
              </View>
            )}
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
      suggestionBox: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        zIndex: 10,
        maxHeight: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        paddingVertical: 4,
      },
      suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
      },
      suggestionImage: {
        width: 32,
        height: 32,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: '#f5f5f5',
      },
      suggestionName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
      },
      suggestionKcal: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
      },
      suggestionLoading: {
        color: '#888',
        textAlign: 'center',
        padding: 10,
      },
      suggestionEmpty: {
        color: '#aaa',
        textAlign: 'center',
        padding: 10,
      },
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
  photoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  photoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
  },
  cameraButton: {
    backgroundColor: "#FF6A88",
  },
  galleryButton: {
    backgroundColor: "#5E72E4",
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  photoPreviewContainer: {
    position: "relative",
    marginTop: 10,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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