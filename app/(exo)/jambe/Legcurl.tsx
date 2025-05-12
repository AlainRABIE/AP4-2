"use client";

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LegCurl() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#FF6A88', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Link href="/(exo)/jambexo" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.title}>Leg Curl</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/images/jambe.png')}
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
              Le leg curl est un exercice d'isolation qui cible spécifiquement les muscles ischio-jambiers (arrière des cuisses). Généralement réalisé sur une machine dédiée, il existe en version allongée ou assise. Cet exercice est essentiel pour développer l'équilibre musculaire entre l'avant et l'arrière de la cuisse, ce qui contribue à prévenir les blessures.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Exécution (version allongée)</Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Allongez-vous à plat ventre sur la machine, avec les genoux légèrement au-delà du bord du banc.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Placez le rouleau rembourré juste au-dessus de vos talons, sur le bas des mollets.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Saisissez les poignées ou le bord du banc pour stabiliser votre corps.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>
                En gardant les hanches fermement appuyées contre le banc, inspirez puis fléchissez les genoux pour ramener vos talons vers vos fessiers.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Contractez fortement les ischio-jambiers lorsque vos jambes sont fléchies à environ 90 degrés (ou aussi loin que possible tout en gardant la bonne technique).
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>6</Text>
              </View>
              <Text style={styles.stepText}>
                Tenez brièvement la position contractée, puis expirez en revenant lentement à la position de départ, sans laisser retomber brusquement le poids.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>7</Text>
              </View>
              <Text style={styles.stepText}>
                Répétez le mouvement pour le nombre de répétitions souhaité.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Exécution (version assise)</Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Asseyez-vous sur la machine avec le dos bien calé contre le dossier et les genoux alignés avec l'axe de rotation de la machine.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Placez vos jambes par-dessus le rouleau rembourré, qui doit être positionné derrière vos chevilles.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Attrapez les poignées latérales pour stabiliser le haut de votre corps.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Inspirez, puis fléchissez les genoux en ramenant vos talons vers l'arrière de vos cuisses.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Contractez fortement les ischio-jambiers au point maximal de flexion.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>6</Text>
              </View>
              <Text style={styles.stepText}>
                Expirez en contrôlant le retour à la position initiale.
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
                Évitez d'utiliser l'élan ou d'arquer le dos pour soulever le poids.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Concentrez-vous sur la sensation dans les ischio-jambiers tout au long du mouvement.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Maintenez une contraction constante dans les muscles ciblés, même lors de la phase de retour.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Gardez vos chevilles relaxées et neutres, sans les fléchir excessivement.
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
                <Text style={styles.musclePrimary}>Principaux</Text>
                <Text style={styles.muscleName}>Ischio-jambiers (Biceps fémoral)</Text>
                <Text style={styles.muscleName}>Ischio-jambiers (Semi-tendineux)</Text>
                <Text style={styles.muscleName}>Ischio-jambiers (Semi-membraneux)</Text>
              </View>
              <View style={styles.muscleItem}>
                <Text style={styles.muscleSecondary}>Secondaires</Text>
                <Text style={styles.muscleName}>Gastrocnémiens (mollets)</Text>
                <Text style={styles.muscleName}>Poplité</Text>
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
                <Text style={styles.programValue}>5 séries x 6-10 répétitions</Text>
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
              <Text style={styles.variantName}>• Leg curl unilatéral</Text>
              <Text style={styles.variantDescription}>
                Effectuez l'exercice avec une jambe à la fois pour corriger les déséquilibres musculaires ou augmenter l'intensité.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Leg curl avec bande élastique</Text>
              <Text style={styles.variantDescription}>
                Version alternative à réaliser en dehors de la salle, en attachant une bande élastique à votre cheville et à un point d'ancrage.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Leg curl isométrique</Text>
              <Text style={styles.variantDescription}>
                Maintenez la position contractée pendant 3-5 secondes pour augmenter l'intensité et le temps sous tension.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Leg curl avec pointe de pied</Text>
              <Text style={styles.variantDescription}>
                Orientez vos pointes de pieds vers l'intérieur ou l'extérieur pour cibler différentes parties des ischio-jambiers.
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
                Soulever les hanches du banc pendant le mouvement (version allongée)
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Utiliser une amplitude de mouvement excessive qui sollicite le bas du dos
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Fléchir excessivement les chevilles pendant le mouvement
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Laisser le poids retomber brusquement à la fin de chaque répétition
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Prévention des blessures</Text>
            </View>
            <Text style={styles.descriptionText}>
              Le renforcement des ischio-jambiers est crucial pour maintenir un équilibre musculaire avec les quadriceps, ce qui aide à prévenir les blessures, particulièrement chez les sportifs.
            </Text>
            <View style={styles.infoContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Les déséquilibres entre quadriceps et ischio-jambiers augmentent le risque de blessure au genou
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Particulièrement important pour les coureurs et les athlètes de sports collectifs
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Améliore la stabilité du genou et peut réduire la douleur au niveau de l'articulation
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Aide à équilibrer la musculature développée par d'autres exercices comme le squat
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
    marginBottom: 12,
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
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