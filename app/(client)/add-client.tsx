import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 
    objectif: '',
    notes: ''
  });

  const [errors, setErrors] = useState({
    nom: false,
    prenom: false,
    email: false
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateFormField = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleChangeDateNaissance = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.dateNaissance;
    setShowDatePicker(Platform.OS === 'ios');
    updateFormField('dateNaissance', currentDate);
  };

  const validateForm = () => {
    const newErrors = {
      nom: !formData.nom.trim(),
      prenom: !formData.prenom.trim(),
      email: !formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleAddClient = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    try {
      setLoading(true);

      const emailCheck = query(
        collection(db, 'utilisateurs'),
        where('email', '==', formData.email.toLowerCase())
      );
      
      const emailSnapshot = await getDocs(emailCheck);
      if (!emailSnapshot.empty) {
        Alert.alert('Erreur', 'Un utilisateur avec cet email existe déjà.');
        setLoading(false);
        return;
      }

      const tempPassword = generateTemporaryPassword();

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.toLowerCase(),
          tempPassword
        );
      } catch (error: any) {
        console.error("Erreur lors de la création du compte Firebase Auth:", error);
        
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erreur', 'Cet email est déjà utilisé.');
        } else {
          Alert.alert('Erreur', 'Impossible de créer le compte. Veuillez réessayer.');
        }
        
        setLoading(false);
        return;
      }

      const coachId = auth.currentUser ? auth.currentUser.uid : null;
      
      if (!coachId) {
        Alert.alert('Erreur', 'Vous devez être connecté pour ajouter un client.');
        setLoading(false);
        return;
      }
      
      const userData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.toLowerCase().trim(),
        telephone: formData.telephone.trim(),
        dateNaissance: formData.dateNaissance,
        objectif: formData.objectif.trim(),
        notes: formData.notes.trim(),
        coachId: coachId,
        role: 'client',
        dateInscription: serverTimestamp(),
        dernierEntrainement: null,
        photoURL: null
      };

      await addDoc(collection(db, 'utilisateurs'), {
        ...userData,
        uid: userCredential.user.uid
      });

      Alert.alert(
        'Succès',
        `Le client ${formData.prenom} ${formData.nom} a été ajouté avec succès. Un mot de passe temporaire a été généré: ${tempPassword}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du client:", error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout du client.");
    } finally {
      setLoading(false);
    }
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un client</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.prenom && styles.inputError]}
            placeholder="Prénom du client"
            value={formData.prenom}
            onChangeText={(text) => updateFormField('prenom', text)}
            placeholderTextColor="#999"
          />
          {errors.prenom && (
            <Text style={styles.errorText}>Le prénom est requis</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.nom && styles.inputError]}
            placeholder="Nom du client"
            value={formData.nom}
            onChangeText={(text) => updateFormField('nom', text)}
            placeholderTextColor="#999"
          />
          {errors.nom && (
            <Text style={styles.errorText}>Le nom est requis</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="adresse@email.com"
            value={formData.email}
            onChangeText={(text) => updateFormField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          {errors.email && (
            <Text style={styles.errorText}>Veuillez entrer un email valide</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="06 12 34 56 78"
            value={formData.telephone}
            onChangeText={(text) => updateFormField('telephone', text)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date de naissance</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDateForDisplay(formData.dateNaissance)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.dateNaissance}
              mode="date"
              display="default"
              onChange={handleChangeDateNaissance}
              maximumDate={new Date()}
            />
          )}
        </View>

        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Informations d'entraînement</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Objectif</Text>
          <TextInput
            style={styles.input}
            placeholder="Objectif d'entraînement"
            value={formData.objectif}
            onChangeText={(text) => updateFormField('objectif', text)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes supplémentaires</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Informations supplémentaires, restrictions médicales, etc."
            value={formData.notes}
            onChangeText={(text) => updateFormField('notes', text)}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddClient}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Ajouter le client</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6A88',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6A88',
  },
  errorText: {
    color: '#FF6A88',
    fontSize: 14,
    marginTop: 5,
  },
  textArea: {
    height: 100,
  },
  dateInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6A88',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});