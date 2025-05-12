"use client";

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LegExtension() {
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
          <Text style={styles.title}>Leg Extension</Text>
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
              L'extension des jambes ou "leg extension" est un exercice d'isolation qui cible spécifiquement les quadriceps, les muscles situés à l'avant des cuisses. Réalisé sur une machine dédiée, cet exercice permet de travailler les quadriceps en isolation complète et constitue un excellent mouvement de finition ou de récupération active dans un programme d'entraînement des jambes.
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
                Asseyez-vous sur la machine à extension de jambes avec le dos bien calé contre le dossier.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Placez vos pieds sous le rouleau de la machine, ajustez-le pour qu'il repose confortablement sur le dessus de vos chevilles.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Ajustez le siège pour que vos genoux soient alignés avec l'axe de rotation de la machine.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Saisissez les poignées latérales pour stabiliser le haut de votre corps.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Inspirez et étendez lentement vos jambes devant vous jusqu'à ce qu'elles soient presque complètement droites (sans verrouiller les genoux).
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>6</Text>
              </View>
              <Text style={styles.stepText}>
                Contractez fortement vos quadriceps au sommet du mouvement pendant 1-2 secondes.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>7</Text>
              </View>
              <Text style={styles.stepText}>
                Expirez en contrôlant la descente et ramenez lentement vos jambes à la position de départ.
              </Text>
            </View>
            <View style={styles.stepContainer}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>8</Text>
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
                Effectuez le mouvement de façon contrôlée, surtout pendant la phase de descente.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Évitez de verrouiller complètement les genoux au sommet du mouvement pour préserver vos articulations.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Maintenez votre dos bien appuyé contre le dossier tout au long de l'exercice.
              </Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Concentrez-vous sur la contraction des quadriceps à chaque répétition.
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
                <Text style={styles.muscleName}>Quadriceps (Droit fémoral)</Text>
                <Text style={styles.muscleName}>Quadriceps (Vaste externe)</Text>
                <Text style={styles.muscleName}>Quadriceps (Vaste interne)</Text>
                <Text style={styles.muscleName}>Quadriceps (Vaste intermédiaire)</Text>
              </View>
              <View style={styles.muscleItem}>
                <Text style={styles.muscleSecondary}>Secondaire</Text>
                <Text style={styles.muscleName}>Tibial antérieur</Text>
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
                <Text style={styles.programValue}>3 séries x 15-20 répétitions</Text>
              </View>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Intermédiaire:</Text>
                <Text style={styles.programValue}>4 séries x 10-15 répétitions</Text>
              </View>
              <View style={styles.programRow}>
                <Text style={styles.programLabel}>Avancé:</Text>
                <Text style={styles.programValue}>4-5 séries x 8-12 répétitions</Text>
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
              <Text style={styles.variantName}>• Extension jambe unilatérale</Text>
              <Text style={styles.variantDescription}>
                Effectuez l'exercice avec une jambe à la fois pour corriger les déséquilibres musculaires.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Extension jambe avec pause</Text>
              <Text style={styles.variantDescription}>
                Marquez un temps d'arrêt de 2-3 secondes en position haute pour intensifier la contraction.
              </Text>
            </View>
            <View style={styles.variantContainer}>
              <Text style={styles.variantName}>• Extension avec pointes de pieds orientées</Text>
              <Text style={styles.variantDescription}>
                Tournez légèrement les pointes de pieds vers l'intérieur ou l'extérieur pour cibler différentes parties des quadriceps.
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
                Verrouiller complètement les genoux en fin de mouvement
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Utiliser l'élan ou soulever les fesses du siège
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Descendre trop rapidement sans contrôler le mouvement
              </Text>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={18} color="#FF3B30" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                Utiliser une charge trop lourde qui compromet la forme
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit-outline" size={22} color="#FF6A88" />
              <Text style={styles.sectionTitle}>Rééducation</Text>
            </View>
            <Text style={styles.descriptionText}>
              La leg extension est souvent utilisée en rééducation après une blessure ou une chirurgie du genou. Dans ce contexte:
            </Text>
            <View style={styles.rehabContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.rehabIcon} />
              <Text style={styles.rehabText}>
                Commencez avec un poids très léger ou sans poids
              </Text>
            </View>
            <View style={styles.rehabContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.rehabIcon} />
              <Text style={styles.rehabText}>
                Augmentez progressivement l'amplitude de mouvement selon les conseils de votre kinésithérapeute
              </Text>
            </View>
            <View style={styles.rehabContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.rehabIcon} />
              <Text style={styles.rehabText}>
                Privilégiez un nombre élevé de répétitions avec une faible charge
              </Text>
            </View>
            <View style={styles.rehabContainer}>
              <Ionicons name="fitness" size={18} color="#03A9F4" style={styles.rehabIcon} />
              <Text style={styles.rehabText}>
                Consultez toujours un professionnel de santé avant de réintégrer cet exercice après une blessure
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
  rehabContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rehabIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  rehabText: {
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