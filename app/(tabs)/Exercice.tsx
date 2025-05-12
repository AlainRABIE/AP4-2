import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Modal, 
  Dimensions, 
  Animated, 
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const exercises = [
  { id: "1", name: "Abdos", image: require("../../assets/images/abdo.png"), route: "/(exo)/abdoexo", color: ["#4facfe", "#00f2fe"] },
  { id: "2", name: "Dorsaux", image: require("../../assets/images/dos.png"), route: "/(exo)/abdoexo", color: ["#13547a", "#80d0c7"] }, 
  { id: "3", name: "Biceps", image: require("../../assets/images/biceps.png"), route: "/(exo)/bicepsexo", color: ["#f83600", "#fe8c00"] }, 
  { id: "4", name: "Jambe", image: require("../../assets/images/jambe.png"), route: "/(exo)/jambexo", color: ["#667eea", "#764ba2"] },
  { id: "5", name: "Pectoraux", image: require("../../assets/images/peck.png"), route: "/(exo)/peckexo", color: ["#ff758c", "#ff7eb3"] }, 
];

const subscriptions = [
  { 
    id: "1", 
    name: "Abonnement Mensuel", 
    price: "9,99€", 
    period: "par mois", 
    features: ["Accès à tous les exercices", "Suivi de progression", "Conseils personnalisés"],
    color: ["#4facfe", "#00f2fe"],
    popular: false
  },
  { 
    id: "2", 
    name: "Abonnement Trimestriel", 
    price: "24,99€", 
    period: "pour 3 mois", 
    features: ["Accès à tous les exercices", "Suivi de progression", "Conseils personnalisés", "Programmes spécialisés"],
    color: ["#f83600", "#fe8c00"],
    popular: true
  },
  { 
    id: "3", 
    name: "Abonnement Annuel", 
    price: "89,99€", 
    period: "par an", 
    features: ["Accès à tous les exercices", "Suivi de progression", "Conseils personnalisés", "Programmes spécialisés", "Consultation avec coach"],
    color: ["#13547a", "#80d0c7"],
    popular: false
  },
];

export default function ExercisesScreen() {
  const router = useRouter(); 
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const toggleSubscriptions = () => {
    if (!showSubscriptions) {
      setShowSubscriptions(true);
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSubscriptions(false);
      });
    }
  };

  const handleExercisePress = (item: { id?: string; name?: string; image?: any; route: any; color?: string[]; }) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (item.route) {
        router.push(item.route);
      }
    });
  };

  const renderItem = ({ item, index }: { item: typeof exercises[0], index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.exerciseCard, { marginLeft: index % 2 === 0 ? 0 : 10 }]}
        onPress={() => handleExercisePress(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={item.color as unknown as readonly [string, string]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.exerciseImageContainer}>
            <Image source={item.image} style={styles.exerciseIcon} resizeMode="contain" />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Exercices</Text>
          <LinearGradient
            colors={["#FF6A88", "#FF99AC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumTextContainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color="white" />
                </View>
                <View>
                  <Text style={styles.premiumTitle}>Premium Fitness</Text>
                  <Text style={styles.premiumSubtitle}>Accès illimité aux exercices</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.upgradeButton} 
                onPress={toggleSubscriptions}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>UPGRADE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Catégories d'exercices</Text>
        
        <View style={styles.exercisesGrid}>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showSubscriptions}
        transparent={true}
        animationType="none"
        onRequestClose={toggleSubscriptions}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScaleAnim }],
                opacity: modalOpacityAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisissez votre formule</Text>
              <TouchableOpacity onPress={toggleSubscriptions} style={styles.closeIconButton}>
                <Ionicons name="close-circle" size={28} color="#ccc" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.subscriptionsList}>
              {subscriptions.map((sub) => (
                <View key={sub.id} style={[styles.subscriptionCard, sub.popular && styles.popularCard]}>
                  {sub.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>POPULAIRE</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={sub.color as unknown as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subscriptionGradient}
                  >
                    <Text style={styles.subscriptionName}>{sub.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{sub.price}</Text>
                      <Text style={styles.period}>{sub.period}</Text>
                    </View>
                  </LinearGradient>
                  
                  <View style={styles.featuresContainer}>
                    {sub.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity style={styles.chooseButton}>
                    <Text style={styles.chooseButtonText}>Choisir</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#303030",
    marginBottom: 20,
  },
  premiumBanner: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#FF6A88",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  premiumContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  premiumTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  premiumSubtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 13,
  },
  upgradeButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  upgradeButtonText: {
    color: "#FF6A88",
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#303030",
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  exercisesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  exerciseCard: {
    width: CARD_WIDTH,
    height: 160,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gradientCard: {
    flex: 1,
    padding: 15,
    justifyContent: "flex-end",
  },
  exerciseImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseIcon: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  exerciseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#303030",
  },
  closeIconButton: {
    padding: 5,
  },
  subscriptionsList: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: 500,
  },
  subscriptionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  popularCard: {
    borderWidth: 2,
    borderColor: "#f83600",
  },
  popularBadge: {
    position: "absolute",
    right: 0,
    top: 10,
    backgroundColor: "#f83600",
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 1,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  popularText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  priceContainer: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 5,
  },
  period: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 14,
  },
  chooseButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#4facfe",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  chooseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});