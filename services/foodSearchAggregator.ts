// services/foodSearchAggregator.ts
// Service pour agréger plusieurs APIs gratuites de recherche d'aliments

export type FoodSuggestion = {
  product_name: string;
  calories?: number;
  image_url?: string;
  source: string;
};

// Open Food Facts
export async function searchOpenFoodFacts(query: string): Promise<FoodSuggestion[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.products || []).map((item: any) => ({
    product_name: item.product_name,
    calories: item.nutriments?.["energy-kcal_100g"] ? Math.round(item.nutriments["energy-kcal_100g"]) : undefined,
    image_url: item.image_url,
    source: "OpenFoodFacts",
  })).filter((item: FoodSuggestion) => item.product_name);
}

// USDA FoodData Central (clé gratuite requise)
const USDA_API_KEY = "DEMO_KEY"; // Remplace par ta clé gratuite
export async function searchUSDA(query: string): Promise<FoodSuggestion[]> {
  if (!USDA_API_KEY || USDA_API_KEY === "DEMO_KEY") return [];
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=10`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.foods || []).map((item: any) => ({
    product_name: item.description,
    calories: item.foodNutrients?.find((n: any) => n.nutrientName === "Energy" && n.unitName === "KCAL")?.value,
    image_url: undefined,
    source: "USDA",
  })).filter((item: FoodSuggestion) => item.product_name);
}

// Themealdb (API gratuite, résultats moins détaillés)
export async function searchThemealdb(query: string): Promise<FoodSuggestion[]> {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.meals || []).map((item: any) => ({
    product_name: item.strMeal,
    calories: undefined,
    image_url: item.strMealThumb,
    source: "Themealdb",
  })).filter((item: FoodSuggestion) => item.product_name);
}

// Fonction d'agrégation
export async function searchAllFoodAPIs(query: string): Promise<FoodSuggestion[]> {
  const [off, usda, tdb] = await Promise.all([
    searchOpenFoodFacts(query),
    searchUSDA(query),
    searchThemealdb(query),
  ]);
  // Fusionne et retire les doublons par nom
  const all = [...off, ...usda, ...tdb];
  const seen = new Set();
  return all.filter(item => {
    if (seen.has(item.product_name.toLowerCase())) return false;
    seen.add(item.product_name.toLowerCase());
    return true;
  });
}
