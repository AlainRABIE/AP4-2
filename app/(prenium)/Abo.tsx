import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, getFirestore } from 'firebase/firestore'; 
import app from '../../firebase/firebaseConfig';

const db = getFirestore(app);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

export default function SubscriptionSelectionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const mainDocRef = collection(db, "abonnement");
        const mainDocSnapshot = await getDocs(mainDocRef);
        
        const plans: SubscriptionPlan[] = [];
        
        for (const doc of mainDocSnapshot.docs) {
          if (doc.id === 'VkDe7XSDpw7NW5iTiOwW') {
            const basicDoc = await getDocs(collection(doc.ref, 'Basic'));
            const plusDoc = await getDocs(collection(doc.ref, 'Plus'));
            const proDoc = await getDocs(collection(doc.ref, 'Pro'));

            basicDoc.forEach(doc => {
              const data = doc.data();
              plans.push({
                id: doc.id,
                name: data.Nom || "Basic",
                price: Number(data.Prix) || 0,
                period: data.Duration === "30" ? "mois" : "an",
                features: data.Feature ? [data.Feature] : []
              });
            });

            plusDoc.forEach(doc => {
              const data = doc.data();
              plans.push({
                id: doc.id,
                name: data.Nom || "Plus",
                price: Number(data.Prix) || 5,
                period: data.Duration === "30" ? "mois" : "an",
                features: data.feature ? [data.feature] : []
              });
            });

            proDoc.forEach(doc => {
              const data = doc.data();
              plans.push({
                id: doc.id,
                name: data.Nom || "Pro",
                price: Number(data.Prix) || 15,
                period: data.Duration === "30" ? "mois" : "an",
                features: data.Feature ? [data.Feature] : []
              });
            });
          }
        }
        
        plans.sort((a, b) => a.price - b.price);
        setSubscriptionPlans(plans);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des abonnements:", error);
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToPayment = () => {
    if (selectedPlan) {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      
      router.push({
        pathname: '/(prenium)/PaymentScreen',
        params: {
          planId: plan?.id,
          planName: plan?.name,
          planPrice: plan?.price.toString(),
          planPeriod: plan?.period
        }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Chargement des abonnements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choisissez votre abonnement</Text>
      <Text style={styles.subtitle}>Sélectionnez un plan qui vous convient</Text>
      
      {subscriptionPlans.map((plan) => (
        <TouchableOpacity 
          key={plan.id}
          style={[
            styles.planCard, 
            selectedPlan === plan.id && styles.selectedPlanCard
          ]}
          onPress={() => handlePlanSelection(plan.id)}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.id === subscriptionPlans[subscriptionPlans.length - 1].id && (
              <View style={styles.bestValueTag}>
                <Text style={styles.bestValueText}>Meilleure offre</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.planPrice}>
            {plan.price.toFixed(2).replace('.', ',')} €
            <Text style={styles.planPeriod}> / {plan.period}</Text>
          </Text>
          
          <View style={styles.featuresContainer}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/447/447147.png' }}
                  style={styles.checkIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.radioContainer}>
            <View style={[
              styles.radioOuter,
              selectedPlan === plan.id && styles.radioOuterSelected
            ]}>
              {selectedPlan === plan.id && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Sélectionner</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        style={[styles.continueButton, !selectedPlan && styles.continueButtonDisabled]}
        onPress={handleContinueToPayment}
        disabled={!selectedPlan}
      >
        <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#64748B',
  },
  planCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPlanCard: {
    borderColor: '#0EA5E9',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  bestValueTag: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'normal',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#10B981',
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#0EA5E9',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  radioText: {
    fontSize: 14,
    color: '#475569',
  },
  continueButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});