import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);

  useEffect(() => {
    checkPedometerPermission();
  }, []);

  const sendCoachRequest = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Erreur", "Vous devez être connecté pour faire cette demande");
        return;
      }
      
      const subject = encodeURIComponent("Demande pour devenir coach");
      const body = encodeURIComponent(
        `Bonjour,\n\n` +
        `Je souhaite devenir coach sur l'application.\n\n` +
        `Informations de l'utilisateur :\n` +
        `- Email: ${user.email}\n` +
        `- ID Utilisateur: ${user.uid}\n\n` +
        `Merci de me contacter pour plus d'informations sur mes compétences et expériences.\n\n` +
        `Cordialement,\n${user.displayName || user.email}`
      );
      
      const mailtoUrl = `mailto:rabie.alain001@gmail.com?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (!canOpen) {
        throw new Error("Impossible d'ouvrir l'application de messagerie");
      }
      
      await Linking.openURL(mailtoUrl);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      Alert.alert(
        "Erreur", 
        "Impossible d'ouvrir l'application de messagerie. Veuillez envoyer un email manuellement à rabie.alain001@gmail.com"
      );
    }
  };

  const checkPedometerPermission = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);
      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        
        const { steps } = await Pedometer.getStepCountAsync(start, end);
        setStepCount(steps);

        Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
        });
      }
    } catch (error) {
      console.log('Erreur podomètre:', error);
    }
  };

  const handleConnectDevice = (deviceType: string) => {
    Alert.alert(
      'Connexion appareil',
      `Voulez-vous connecter votre ${deviceType}?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Connecter',
          onPress: () => {
            setConnectedDevices([...connectedDevices, deviceType]);
            Alert.alert('Succès', `${deviceType} connecté avec succès!`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Réglages</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Mon compte</Text>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Informations personnelles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Plan nutritionnel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="school" size={24} color="#FF6A88" />
            <Text style={styles.sectionTitle}>Devenir Coach</Text>
          </View>
          <Text style={styles.coachInfoText}>
            Vous êtes un professionnel de la nutrition ou du fitness ? Partagez votre expertise en devenant coach sur notre plateforme.
          </Text>
          <TouchableOpacity 
            style={styles.coachButton}
            onPress={sendCoachRequest}
          >
            <Text style={styles.coachButtonText}>Postuler pour devenir coach</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="balance-scale" size={24} color="#22c55e" />
            <Text style={styles.sectionTitle}>Objectifs & Suivi</Text>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Objectif de poids</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Besoins caloriques</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Répartition des macros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Aliments favoris</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Mes recettes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="directions-walk" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Podomètre</Text>
          </View>
          <View style={styles.pedometerContainer}>
            {isPedometerAvailable ? (
              <>
                <Text style={styles.stepCount}>{stepCount}</Text>
                <Text style={styles.stepLabel}>pas aujourd'hui</Text>
              </>
            ) : (
              <Text style={styles.unavailableText}>
                Le podomètre n'est pas disponible sur cet appareil
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="watch" size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Appareils connectés</Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleConnectDevice('Apple Watch')}
          >
            <View style={styles.deviceButton}>
              <Text style={styles.buttonText}>Apple Watch</Text>
              {connectedDevices.includes('Apple Watch') && (
                <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleConnectDevice('Samsung Watch')}
          >
            <View style={styles.deviceButton}>
              <Text style={styles.buttonText}>Samsung Watch</Text>
              {connectedDevices.includes('Samsung Watch') && (
                <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleConnectDevice('Fitbit')}
          >
            <View style={styles.deviceButton}>
              <Text style={styles.buttonText}>Fitbit</Text>
              {connectedDevices.includes('Fitbit') && (
                <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="help" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Guide d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Contactez-nous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Confidentialité</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    marginVertical: 4,
  },
  deviceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pedometerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  stepCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  stepLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  unavailableText: {
    color: '#666',
    textAlign: 'center',
  },
  coachInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  coachButton: {
    backgroundColor: '#FF6A88',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  coachButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
});