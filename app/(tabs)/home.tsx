import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { 
  fetchMealByDate, 
  fetchAllMealsByDate, 
  calculateCaloriesForDay, 
  calculateBurnedCalories,
  Aliment
} from '../../services/calorie';

interface RepasData {
  "Petit-déjeuner": Aliment[];
  "Déjeuner": Aliment[];
  "Dîner": Aliment[];
  "Collation": Aliment[];
}

const COLORS = {
  background: '#ECEFF1',  
  cardBackground: '#ECEFF1',
  shadowDark: '#C7CCD1',  
  shadowLight: '#FFFFFF', 
  textPrimary: '#37474F',
  textSecondary: '#78909C',
  accent: '#FF5722',     
  blue: '#03A9F4',       
  green: '#4CAF50',      
  pink: '#E91E63',       
  purple: '#673AB7',     
};

const { width } = Dimensions.get("window");
const cardWidth = width - 40;

const NutritionScreen = () => {
  const [currentDay, setCurrentDay] = useState(new Date());
  const [streak, setStreak] = useState(3);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const [caloriesTotales, setCaloriesTotales] = useState(0);
  const [caloriesRestantes, setCaloriesRestantes] = useState(0);
  const [caloriesBrulees, setCaloriesBrulees] = useState(0);

  const [breakfastCalories, setBreakfastCalories] = useState(0);
  const [lunchCalories, setLunchCalories] = useState(0);
  const [dinnerCalories, setDinnerCalories] = useState(0);
  const [snackCalories, setSnackCalories] = useState(0);
  
  const [repasData, setRepasData] = useState<RepasData>({
    "Petit-déjeuner": [],
    "Déjeuner": [],
    "Dîner": [],
    "Collation": []
  });

  const router = useRouter();

  useEffect(() => {
    const startPedometer = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(available);

        if (available) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          try {
            const pastStepData = await Pedometer.getStepCountAsync(start, end);
            if (pastStepData) {
              setSteps(pastStepData.steps);
            }

            const subscription = Pedometer.watchStepCount(result => {
              setSteps(currentSteps => currentSteps + result.steps);
            });

            return () => {
              if (subscription) {
                subscription.remove();
              }
            };
          } catch (err) {
            console.error("Erreur lors de l'accès au podomètre:", err);
          }
        } else {
          console.log("Le podomètre n'est pas disponible sur cet appareil");
        }
      } catch (error) {
        console.error("Erreur d'initialisation du podomètre:", error);
      }
    };

    startPedometer();
  }, []);

  const fetchAllMealData = useCallback(async () => {
    setLoading(true);
    try {
      const allMeals = await fetchAllMealsByDate(currentDay);
      
      setBreakfastCalories(allMeals["Petit-déjeuner"].totalCalories);
      setLunchCalories(allMeals["Déjeuner"].totalCalories);
      setDinnerCalories(allMeals["Dîner"].totalCalories);
      setSnackCalories(allMeals["Collation"].totalCalories);
      
      setRepasData({
        "Petit-déjeuner": allMeals["Petit-déjeuner"].meals,
        "Déjeuner": allMeals["Déjeuner"].meals,
        "Dîner": allMeals["Dîner"].meals,
        "Collation": allMeals["Collation"].meals
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des repas:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDay]);

  const fetchPedometerData = useCallback(async () => {
    try {
      if (isPedometerAvailable) {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
      
        const pastStepData = await Pedometer.getStepCountAsync(start, end);
        if (pastStepData) {
          setSteps(pastStepData.steps);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des pas:", error);
    }
  }, [isPedometerAvailable]);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await Promise.all([
          fetchPedometerData(),
          fetchAllMealData()
        ]);
      };

      refreshData();
    }, [fetchPedometerData, fetchAllMealData])
  );
  
  useEffect(() => {
    fetchAllMealData();
  }, [currentDay, fetchAllMealData]);

  useEffect(() => {
    const fetchCalories = async () => {
      try {
        const caloriesData = await calculateCaloriesForDay(currentDay);
        
        setCaloriesTotales(caloriesData.caloriesTotales);
        setCaloriesRestantes(caloriesData.caloriesRestantes);
        
        const caloriesBrulees = calculateBurnedCalories(steps);
        setCaloriesBrulees(caloriesBrulees);
      } catch (error) {
        console.error("Erreur lors du calcul des calories :", error);
      }
    };

    fetchCalories();
  }, [steps, breakfastCalories, lunchCalories, dinnerCalories, snackCalories, currentDay]);

  const handleAddGlass = () => {
    if (waterGlasses < 8) setWaterGlasses(waterGlasses + 1);
  };

  const handleRemoveGlass = () => {
    if (waterGlasses > 0) setWaterGlasses(waterGlasses - 1);
  };

  const navigateToAddMeal = (mealType: string) => {
    const dateParam = currentDay.toISOString();
    
    switch (mealType) {
      case "Déjeuner":
        router.push({
          pathname: "/(calorie)/AddMidi",
          params: { date: dateParam }
        });
        break;
      case "Dîner":
        router.push({
          pathname: "/(calorie)/AddSoir",
          params: { date: dateParam }
        });
        break;
      default:
        router.push({
          pathname: "/(calorie)/Add",
          params: { mealType, date: dateParam }
        });
    }
  };

  const calculateProgressPercentage = (consumed: number, total: number) => {
    if (total <= 0) return 0;
    const percentage = (consumed / total) * 100;
    return Math.min(percentage, 100); 
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          
          <View style={styles.dateNavigationContainer}>
            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(currentDay);
                newDate.setDate(newDate.getDate() - 1);
                setCurrentDay(newDate);
              }}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(currentDay)}</Text>
              {streak > 0 && (
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color={COLORS.accent} />
                  <Text style={styles.streakText}>{streak} jours</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(currentDay);
                newDate.setDate(newDate.getDate() + 1);
                setCurrentDay(newDate);
              }}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{caloriesTotales}</Text>
              <Text style={styles.statLabel}>Objectif kcal</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.blue} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{caloriesRestantes}</Text>
              <Text style={styles.statLabel}>Restantes kcal</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="fitness-outline" size={24} color={COLORS.green} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{caloriesBrulees}</Text>
              <Text style={styles.statLabel}>Brûlées kcal</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="water-outline" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.cardTitle}>Hydratation</Text>
            </View>
            <Text style={styles.waterCount}>{waterGlasses}/8</Text>
          </View>
          
          <View style={styles.waterGlassesContainer}>
            {Array.from({ length: 8 }).map((_, index) => (
              <View key={index} style={styles.glassWrapper}>
                <View style={[
                  styles.glassIndicator, 
                  index < waterGlasses ? styles.glassActive : styles.glassInactive
                ]}>
                  <Ionicons 
                    name={index < waterGlasses ? "water" : "water-outline"} 
                    size={20} 
                    color={index < waterGlasses ? COLORS.blue : COLORS.textSecondary} 
                  />
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(waterGlasses / 8) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.waterButtonsContainer}>
            <TouchableOpacity 
              onPress={handleRemoveGlass} 
              style={styles.circleButton}
            >
              <Ionicons name="remove" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleAddGlass} 
              style={styles.circleButton}
            >
              <Ionicons name="add" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="restaurant-outline" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.cardTitle}>Repas</Text>
            </View>
          </View>
          
          <View style={styles.mealList}>
            <TouchableOpacity 
              style={styles.mealRow}
              onPress={() => navigateToAddMeal("Petit-déjeuner")}
              activeOpacity={0.8}
            >
              <View style={[styles.mealIconCircle, {backgroundColor: COLORS.pink}]}>
                <Ionicons name="sunny" size={18} color="#FFF" />
              </View>
              
              <View style={styles.mealDetails}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle}>Petit-déjeuner</Text>
                  <Text style={styles.mealCalories}>{breakfastCalories} kcal</Text>
                </View>
                
                <View style={styles.mealProgressTrack}>
                  <View 
                    style={[
                      styles.mealProgressFill, 
                      { 
                        width: `${calculateProgressPercentage(breakfastCalories, caloriesTotales * 0.25)}%`,
                        backgroundColor: COLORS.pink
                      }
                    ]} 
                  />
                </View>
                
                {repasData["Petit-déjeuner"] && repasData["Petit-déjeuner"].length > 0 ? (
                  <View style={styles.foodItemsContainer}>
                    {repasData["Petit-déjeuner"].map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <Text style={styles.foodName}>{item.nom}</Text>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMealText}>Aucun aliment pour ce jour</Text>
                )}
              </View>
              
              <View style={styles.mealChevron}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mealRow}
              onPress={() => navigateToAddMeal("Déjeuner")}
              activeOpacity={0.8}
            >
              <View style={[styles.mealIconCircle, {backgroundColor: COLORS.accent}]}>
                <Ionicons name="restaurant" size={18} color="#FFF" />
              </View>
              
              <View style={styles.mealDetails}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle}>Déjeuner</Text>
                  <Text style={styles.mealCalories}>{lunchCalories} kcal</Text>
                </View>
                
                <View style={styles.mealProgressTrack}>
                  <View 
                    style={[
                      styles.mealProgressFill, 
                      { 
                        width: `${calculateProgressPercentage(lunchCalories, caloriesTotales * 0.40)}%`,
                        backgroundColor: COLORS.accent
                      }
                    ]} 
                  />
                </View>
                
                {repasData["Déjeuner"] && repasData["Déjeuner"].length > 0 ? (
                  <View style={styles.foodItemsContainer}>
                    {repasData["Déjeuner"].map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <Text style={styles.foodName}>{item.nom}</Text>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMealText}>Aucun aliment pour ce jour</Text>
                )}
              </View>
              
              <View style={styles.mealChevron}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mealRow}
              onPress={() => navigateToAddMeal("Dîner")}
              activeOpacity={0.8}
            >
              <View style={[styles.mealIconCircle, {backgroundColor: COLORS.purple}]}>
                <Ionicons name="moon" size={18} color="#FFF" />
              </View>
              
              <View style={styles.mealDetails}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle}>Dîner</Text>
                  <Text style={styles.mealCalories}>{dinnerCalories} kcal</Text>
                </View>
                
                <View style={styles.mealProgressTrack}>
                  <View 
                    style={[
                      styles.mealProgressFill, 
                      { 
                        width: `${calculateProgressPercentage(dinnerCalories, caloriesTotales * 0.25)}%`,
                        backgroundColor: COLORS.purple
                      }
                    ]} 
                  />
                </View>
                
                {repasData["Dîner"] && repasData["Dîner"].length > 0 ? (
                  <View style={styles.foodItemsContainer}>
                    {repasData["Dîner"].map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <Text style={styles.foodName}>{item.nom}</Text>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMealText}>Aucun aliment pour ce jour</Text>
                )}
              </View>
              
              <View style={styles.mealChevron}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mealRow, {borderBottomWidth: 0}]}
              onPress={() => navigateToAddMeal("Collation")}
              activeOpacity={0.8}
            >
              <View style={[styles.mealIconCircle, {backgroundColor: COLORS.green}]}>
                <Ionicons name="ice-cream" size={18} color="#FFF" />
              </View>
              
              <View style={styles.mealDetails}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle}>Collation</Text>
                  <Text style={styles.mealCalories}>{snackCalories} kcal</Text>
                </View>
                
                <View style={styles.mealProgressTrack}>
                  <View 
                    style={[
                      styles.mealProgressFill, 
                      { 
                        width: `${calculateProgressPercentage(snackCalories, caloriesTotales * 0.10)}%`,
                        backgroundColor: COLORS.green
                      }
                    ]} 
                  />
                </View>
                
                {repasData["Collation"] && repasData["Collation"].length > 0 ? (
                  <View style={styles.foodItemsContainer}>
                    {repasData["Collation"].map((item) => (
                      <View key={item.id} style={styles.foodItem}>
                        <Text style={styles.foodName}>{item.nom}</Text>
                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMealText}>Aucun aliment pour ce jour</Text>
                )}
              </View>
              
              <View style={styles.mealChevron}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="footsteps-outline" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.cardTitle}>Activité physique</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.stepsInfo}>
              <Text style={styles.stepsCount}>{steps}</Text>
              <Text style={styles.stepsLabel}>pas aujourd'hui</Text>
              
              <View style={styles.stepsProgressTrack}>
                <View 
                  style={[
                    styles.stepsProgressFill, 
                    { width: `${Math.min((steps / 10000) * 100, 100)}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.stepsGoalText}>
                {Math.floor((steps / 10000) * 100)}% de l'objectif (10 000 pas)
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.caloriesBurned}>
              <View style={styles.caloriesIconCircle}>
                <Ionicons name="flame" size={22} color="#FFF" />
              </View>
              <Text style={styles.caloriesBurnedValue}>{caloriesBrulees}</Text>
              <Text style={styles.caloriesBurnedLabel}>calories brûlées</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.accent,
    marginLeft: 5,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (cardWidth - 20) / 3,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardContainer: {
    width: cardWidth,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  waterCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blue,
  },
  waterGlassesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  glassWrapper: {
    alignItems: 'center',
  },
  glassIndicator: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassActive: {
    backgroundColor: 'rgba(3, 169, 244, 0.15)',
  },
  glassInactive: {
    backgroundColor: COLORS.background,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 4,
  },
  waterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addMealButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3.84,
    elevation: 3,
  },
  mealList: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  mealIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDetails: {
    flex: 1,
    marginLeft: 16,
  },
  mealTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  mealProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  mealProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mealChevron: {
    marginLeft: 10,
  },
  activityCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 18,
  },
  stepsInfo: {
    marginBottom: 20,
  },
  stepsCount: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  stepsProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stepsProgressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  stepsGoalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 16,
  },
  caloriesBurned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  caloriesBurnedValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  caloriesBurnedLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  foodItemsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  emptyMealText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export default NutritionScreen;