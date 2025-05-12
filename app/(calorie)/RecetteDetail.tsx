import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const RecetteDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const translateText = async (text: string, targetLang: string) => {
    try {
      const sourceLang = targetLang === 'fr' ? 'en' : 'fr';
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      return text;
    }
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          const mealData = data.meals[0];
          
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = mealData[`strIngredient${i}`];
            const measure = mealData[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
              ingredients.push({
                ingredient: await translateText(ingredient, 'fr'),
                measure: measure ? measure.trim() : ''
              });
            }
          }

          const translatedMeal = {
            ...mealData,
            strMeal: await translateText(mealData.strMeal, 'fr'),
            strCategory: await translateText(mealData.strCategory, 'fr'),
            strArea: await translateText(mealData.strArea, 'fr'),
            strInstructions: await translateText(mealData.strInstructions, 'fr'),
            ingredients
          };
          
          setRecipe(translatedMeal);
        } else {
          setError('Recette non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        setError('Impossible de charger les détails de la recette');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement des détails de la recette...</Text>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={60} color="#FF6A88" />
        <Text style={styles.errorText}>{error || 'Une erreur est survenue'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour aux recettes</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={{ uri: recipe.strMealThumb }} style={styles.recipeImage} />
        
        <TouchableOpacity 
          style={styles.backArrow}
          onPress={() => router.back()}
        >
          <View style={styles.backArrowBg}>
            <Ionicons name="arrow-back" size={24} color="#FF6A88" />
          </View>
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={styles.recipeTitle}>{recipe.strMeal}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="restaurant-outline" size={20} color="#FF6A88" />
              <Text style={styles.infoText}>{recipe.strCategory}</Text>
            </View>
            {recipe.strArea && (
              <View style={styles.infoItem}>
                <Ionicons name="globe-outline" size={20} color="#FF6A88" />
                <Text style={styles.infoText}>{recipe.strArea}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <LinearGradient
              colors={['#FF6A88', '#FF99AC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>Ingrédients</Text>
            </LinearGradient>
            
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((item: any, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#FF6A88" />
                  <Text style={styles.ingredientText}>
                    {item.measure} {item.ingredient}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <LinearGradient
              colors={['#FF6A88', '#FF99AC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>Instructions</Text>
            </LinearGradient>
            
            <Text style={styles.instructionsText}>{recipe.strInstructions}</Text>
          </View>
          
          {recipe.strYoutube && (
            <View style={styles.section}>
              <LinearGradient
                colors={['#FF6A88', '#FF99AC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionHeader}
              >
                <Text style={styles.sectionTitle}>Vidéo</Text>
              </LinearGradient>
              
              <TouchableOpacity style={styles.youtubeButton}>
                <Ionicons name="logo-youtube" size={24} color="white" />
                <Text style={styles.youtubeText}>Voir la vidéo sur YouTube</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6A88',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  backArrow: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backArrowBg: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  contentContainer: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  ingredientsList: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  youtubeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default RecetteDetail;