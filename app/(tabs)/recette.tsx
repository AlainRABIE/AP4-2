import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Keyboard,
  Dimensions
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const RECIPE_CARD_WIDTH = width - 32;

const commonIngredients = [
  "poulet", "boeuf", "poisson", "fromage", "tomate", 
  "riz", "pâtes", "pomme de terre", "carotte", "oeuf"
];

const RecettePage = () => {
  const router = useRouter();
  const [recipes, setRecipes] = useState<{ idMeal: string; strMeal: string; strCategory: string; strMealThumb: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (ingredients.length > 0) {
      const filtered = commonIngredients.filter(item => 
        item.toLowerCase().includes(ingredients.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [ingredients]);

  const translateText = async (text: string, targetLang: string) => {
    try {
      const sourceLang = targetLang === 'en' ? 'fr' : 'en';
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();

      const translatedText = data.responseData.translatedText as string;
      const uncodedText = translatedText
        .replace(/%20/g, ' ')
        .replace(/%2C/g, ',')
        .replace(/%26/g, '&');
      return uncodedText;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      return text;
    }
  };

  const searchRecipes = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    if (!recentSearches.includes(ingredients)) {
      setRecentSearches(prev => [ingredients, ...prev.slice(0, 4)]);
    }

    try {
      const ingredientEnglish = await translateText(ingredients, 'en');
      
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientEnglish}`);
      const data = await response.json();
      
      if (data.meals) {
        const detailedRecipes = await Promise.all(
          data.meals.slice(0, 15).map(async (recipe: any) => {
            try {
              const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
              const detailData = await detailResponse.json();
              const mealDetails = detailData.meals[0];
              
              return {
                ...recipe,
                strMeal: await translateText(recipe.strMeal, 'fr'),
                strCategory: mealDetails.strCategory ? await translateText(mealDetails.strCategory, 'fr') : '',
                strMealThumb: recipe.strMealThumb
              };
            } catch (error) {
              console.error('Erreur de récupération des détails:', error);
              return {
                ...recipe,
                strMeal: await translateText(recipe.strMeal, 'fr'),
                strMealThumb: recipe.strMealThumb
              };
            }
          })
        );
        
        setRecipes(detailedRecipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setRecipes([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (ingredients) {
      await searchRecipes();
    }
    setRefreshing(false);
  };

  const selectSuggestion = (suggestion: string) => {
    setIngredients(suggestion);
    setShowSuggestions(false);
    searchRecipes();
  };

  const selectRecentSearch = (search: string) => {
    setIngredients(search);
    searchRecipes();
  };

  const navigateToRecipeDetail = (recipeId: string) => {
    router.push(`/(calorie)/RecetteDetail?id=${recipeId}`);
  };

  const renderRecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      activeOpacity={0.8}
      onPress={() => navigateToRecipeDetail(item.idMeal)}
    >
      <Image 
        source={{ uri: item.strMealThumb }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>{item.strMeal}</Text>
        {item.strCategory && (
          <View style={styles.categoryContainer}>
            <Ionicons name="restaurant-outline" size={16} color="#FF6A88" />
            <Text style={styles.recipeCategory}>{item.strCategory}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF6A88', '#FF99AC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Découvrez de nouvelles recettes</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Quel ingrédient avez-vous ?"
            placeholderTextColor="#999"
          />
          {ingredients.length > 0 && (
            <TouchableOpacity 
              onPress={() => setIngredients('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={searchRecipes}
        >
          <Ionicons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionItem}
              onPress={() => selectSuggestion(suggestion)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#666" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {recentSearches.length > 0 && !loading && recipes.length === 0 && !showSuggestions && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recherches récentes</Text>
          <View style={styles.recentSearchesList}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.recentSearchItem}
                onPress={() => selectRecentSearch(search)}
              >
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.recentSearchText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A88" />
          <Text style={styles.loadingText}>Recherche de recettes...</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderRecipeCard}
          contentContainerStyle={styles.recipesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6A88"]} />
          }
          ListEmptyComponent={
            ingredients ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Aucune recette trouvée pour "{ingredients}"</Text>
                <Text style={styles.emptySubtext}>Essayez avec un autre ingrédient</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 10,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#FF6A88',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FF6A88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  suggestionText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  recentSearchesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recentSearchesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  recentSearchText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  recipesList: {
    padding: 16,
  },
  recipeCard: {
    width: RECIPE_CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 180,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCategory: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  }
});

export default RecettePage;