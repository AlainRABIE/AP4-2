"";

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CurlIncline() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#FF6A88', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Link href="/(exo)/bicepsexo" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.title}>Curl Incliné</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/images/biceps.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>
              Le curl incliné est un exercice d'isolation qui cible spécifiquement les biceps. Réalisé sur un banc incliné, 
              il place les bras dans une position qui étire complètement le biceps et élimine la possibilité de tricher 
              avec le reste du corps, ce qui en fait un exercice très efficace pour développer la force et la masse musculaire.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Exécution</Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Réglez un banc d'exercice avec une inclinaison de 45-60 degrés.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Asseyez-vous sur le banc incliné avec le dos bien calé contre le dossier.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Tenez un haltère dans chaque main, bras tendus verticalement vers le sol, paumes vers l'avant.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Sans bouger les coudes, fléchissez les bras pour amener les haltères vers vos épaules.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Contractez fortement vos biceps au sommet du mouvement pendant 1-2 secondes.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>6</Text>
              </View>
              <Text style={styles.stepText}>
                Redescendez lentement les haltères en contrôlant le mouvement jusqu'à extension complète des bras.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>7</Text>
              </View>
              <Text style={styles.stepText}>
                Répétez le mouvement pour le nombre de répétitions prévu dans votre programme.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Conseils techniques</Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Maintenez le haut du corps plaqué contre le banc tout au long de l'exercice.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Gardez les épaules stables et n'utilisez que les biceps pour soulever les poids.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Contrôlez la phase d'abaissement pour augmenter la tension dans les biceps.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Évitez de balancer les haltères et effectuez l'exercice de manière contrôlée.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="body-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Muscles sollicités</Text>
            </View>
            <View style={styles.muscleContainer}>
              <View style={styles.muscleItem}>
                <Text style={styles.musclePrimary}>Principal</Text>
                <Text style={styles.muscleName}>Biceps brachial (partie longue)</Text>
              </View>
              <View style={styles.muscleItem}>
                <Text style={styles.muscleSecondary}>Secondaires</Text>
                <Text style={styles.muscleName}>Brachial antérieur</Text>
                <Text style={styles.muscleName}>Brachio-radial</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Programme recommandé</Text>
            </View>
            <View style={styles.programContainer}>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Débutant:</Text>
                <Text style={styles.programValue}>3 séries x 12-15 répétitions</Text>
              </View>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Intermédiaire:</Text>
                <Text style={styles.programValue}>4 séries x 8-12 répétitions</Text>
              </View>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Avancé:</Text>
                <Text style={styles.programValue}>4-5 séries x 6-10 répétitions</Text>
              </View>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Temps de repos:</Text>
                <Text style={styles.programValue}>60-90 secondes entre les séries</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="options-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Variantes</Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Curl incliné alterné</Text>
              <Text style={styles.variantDescription}>
                Travaillez un bras après l'autre pour une meilleure concentration sur chaque biceps.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Curl incliné avec rotation</Text>
              <Text style={styles.variantDescription}>
                Partez avec les paumes face à face et tournez les poignets pendant la montée pour finir paumes vers le haut.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Curl incliné avec arrêt</Text>
              <Text style={styles.variantDescription}>
                Marquez un temps d'arrêt de 2-3 secondes au milieu du mouvement pour intensifier le travail.
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Avantages spécifiques</Text>
            </View>
            <View style={styles.benefitContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Étirement complet du biceps en position basse pour un meilleur développement musculaire
              </Text>
            </View>
            <View style={styles.benefitContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Empêche de tricher avec le dos ou les épaules, garantissant un travail isolé
              </Text>
            </View>
            <View style={styles.benefitContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Travaille particulièrement la longue portion du biceps grâce à la position d'étirement
              </Text>
            </View>
            <View style={styles.benefitContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>
                Excellent pour développer le pic du biceps (partie supérieure)
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Erreurs à éviter</Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Décoller le dos ou les épaules du banc pendant l'exercice
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Utiliser l'élan pour soulever les poids
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Ne pas descendre complètement les bras en position basse
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Choisir une charge trop lourde qui compromet la technique
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: width * 0.9,
    height: 200,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6A88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  benefitIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  muscleContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  muscleItem: {
    marginBottom: 10,
  },
  musclePrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6A88',
    marginBottom: 4,
  },
  muscleSecondary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF8E53',
    marginBottom: 4,
  },
  muscleName: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
    marginBottom: 2,
  },
  programContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  programLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  programValue: {
    fontSize: 15,
    color: '#444',
  },
  variantContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  variantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 21,
  },
});