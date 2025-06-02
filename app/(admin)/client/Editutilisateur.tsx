import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../firebase/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface User {
  id: string;
  email: string;
  nomComplet?: string;
  dateNaissance?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  image?: string;
  role?: string;
}

 function EditUtilisateur() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id as string);
    } else {
      setLoading(false);
      Alert.alert('Erreur', 'ID utilisateur non spécifié');
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'utilisateurs', userId));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);
        if (userData.image) {
          setImage(userData.image);
        }
      } else {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin des permissions pour accéder à votre galerie');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin des permissions pour accéder à votre caméra');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const filename = `user_${user?.id}_${Date.now()}`;
      const storageRef = ref(storage, `users/${filename}`);
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw new Error('Impossible de télécharger l\'image');
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (user) {
      setUser({ ...user, [field]: value });
    }
  };

  const saveChanges = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      let imageUrl = user.image;
      
      if (image && imageChanged) {
        imageUrl = await uploadImage(image);
      }
      
      const userRef = doc(db, 'utilisateurs', user.id);
      await updateDoc(userRef, {
        nomComplet: user.nomComplet || '',
        dateNaissance: user.dateNaissance || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        codePostal: user.codePostal || '',
        image: imageUrl || null,
      });
      
      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modifications:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement des informations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Modifier le profil</Text>
      </View>

      <View style={styles.profileImageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="person" size={80} color="#CBD5E1" />
          </View>
        )}
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={20} color="white" />
            <Text style={styles.imageButtonText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <MaterialIcons name="camera-alt" size={20} color="white" />
            <Text style={styles.imageButtonText}>Caméra</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            value={user?.nomComplet || ''}
            onChangeText={(value) => handleInputChange('nomComplet', value)}
            placeholder="Entrez votre nom complet"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Date de naissance</Text>
          <TextInput
            style={styles.input}
            value={user?.dateNaissance || ''}
            onChangeText={(value) => handleInputChange('dateNaissance', value)}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={user?.telephone || ''}
            onChangeText={(value) => handleInputChange('telephone', value)}
            placeholder="Entrez votre numéro de téléphone"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adresse</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={user?.adresse || ''}
            onChangeText={(value) => handleInputChange('adresse', value)}
            placeholder="Entrez votre adresse"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            style={styles.input}
            value={user?.ville || ''}
            onChangeText={(value) => handleInputChange('ville', value)}
            placeholder="Entrez votre ville"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Code postal</Text>
          <TextInput
            style={styles.input}
            value={user?.codePostal || ''}
            onChangeText={(value) => handleInputChange('codePostal', value)}
            placeholder="Entrez votre code postal"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveChanges}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <MaterialIcons name="save" size={24} color="white" />
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6A88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  imageButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  disabledInput: {
    backgroundColor: '#E2E8F0',
    color: '#64748B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6A88',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default EditUtilisateur;