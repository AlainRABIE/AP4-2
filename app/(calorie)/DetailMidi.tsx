import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchMealByDate, Aliment } from '../../services/calorie';

const COLORS = {
  background: '#ECEFF1',
  cardBackground: '#FFFFFF',
  textPrimary: '#37474F',
  textSecondary: '#78909C',
  accent: '#FF5722',
};

const DetailMidi = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);
  
  // Date depuis les paramètres (peut être au format ISO string)
  const dateParam = params.date as string;
  const date = dateParam ? new Date(dateParam) : new Date();
  
  useEffect(() => {
    const loadAliments = async () => {
      setLoading(true);
      try {
        const result = await fetchMealByDate(date, "Déjeuner");
        setAliments(result.meals);
        setTotalCalories(result.totalCalories);
      } catch (error) {
        console.error("Erreur lors du chargement du déjeuner:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAliments();
  }, [date]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };
  const renderAlimentItem = ({ item }: { item: Aliment }) => (
    <View style={styles.alimentCard}>
      <View style={styles.alimentInfo}>
        <View style={[styles.alimentImage, styles.placeholderImage]}>
          <Ionicons name="restaurant-outline" size={28} color={COLORS.textSecondary} />
        </View>
        <View style={styles.alimentDetails}>
          <Text style={styles.alimentName}>{item.nom}</Text>
          <Text style={styles.alimentCalories}>{item.calories} kcal</Text>
        </View>
      </View>
    </View>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sad-outline" size={48} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>Aucun aliment trouvé</Text>
      <Text style={styles.emptySubtext}>
        Vous n'avez pas encore ajouté d'aliments pour le déjeuner de cette journée.
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push({
          pathname: "/(calorie)/AddMidi",
          params: { date: dateParam }
        })}
      >
        <Text style={styles.addButtonText}>Ajouter un aliment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du déjeuner</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <View style={[styles.mealIconCircle, {backgroundColor: COLORS.accent}]}>
            <Ionicons name="restaurant" size={22} color="#FFF" />
          </View>
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>Total des calories</Text>
          <Text style={styles.summaryCalories}>{totalCalories} kcal</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Aliments consommés</Text>
      
      {aliments.length > 0 ? (
        <FlatList
          data={aliments}
          renderItem={renderAlimentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.alimentsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <EmptyList />
        </ScrollView>
      )}

      {aliments.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => router.push({
            pathname: "/(calorie)/AddMidi",
            params: { date: dateParam }
          })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIconContainer: {
    justifyContent: 'center',
    marginRight: 16,
  },
  mealIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryCalories: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  alimentsList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  alimentCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alimentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alimentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alimentDetails: {
    flex: 1,
  },
  alimentName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  alimentCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default DetailMidi;