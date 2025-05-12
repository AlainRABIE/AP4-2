"use client";

import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';

type Exercice = {
  id: string;
  nom: string;
  series: number;
  repetitions: number;
  repos: number;
  description: string;
};

type Utilisateur = {
  id: string;
  nomComplet: string;
  email: string;
};

export default function CreerProgrammeScreen() {
  const [nomProgramme, setNomProgramme] = useState('');
  const [descriptionProgramme, setDescriptionProgramme] = useState('');
  const [dureeEnSemaines, setDureeEnSemaines] = useState('4');
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(false);

  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<Utilisateur | null>(null);
  const [modalUtilisateurVisible, setModalUtilisateurVisible] = useState(false);
  const [rechercheUtilisateur, setRechercheUtilisateur] = useState('');

  const [modalExerciceVisible, setModalExerciceVisible] = useState(false);
  const [nouvelExercice, setNouvelExercice] = useState({
    nom: '',
    series: '3',
    repetitions: '12',
    repos: '60',
    description: ''
  });

  useEffect(() => {
    const chargerUtilisateurs = async () => {
      try {
        setLoading(true);
        const utilisateursRef = collection(db, 'utilisateurs');
        const q = query(utilisateursRef, where("role", "==", "utilisateur"));
        const querySnapshot = await getDocs(q);
        
        const utilisateursData: Utilisateur[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          utilisateursData.push({
            id: doc.id,
            nomComplet: data.nomComplet || 'Sans nom',
            email: data.email || 'Sans email'
          });
        });
        
        setUtilisateurs(utilisateursData);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        Alert.alert("Erreur", "Impossible de charger la liste des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    chargerUtilisateurs();
  }, []);

  const utilisateursFiltres = utilisateurs.filter(user => 
    user.nomComplet.toLowerCase().includes(rechercheUtilisateur.toLowerCase()) ||
    user.email.toLowerCase().includes(rechercheUtilisateur.toLowerCase())
  );
  const ajouterExercice = () => {
    if (!nouvelExercice.nom) {
      Alert.alert("Erreur", "Le nom de l'exercice est obligatoire.");
      return;
    }

    const exercice: Exercice = {
      id: Date.now().toString(),
      nom: nouvelExercice.nom,
      series: parseInt(nouvelExercice.series) || 3,
      repetitions: parseInt(nouvelExercice.repetitions) || 12,
      repos: parseInt(nouvelExercice.repos) || 60,
      description: nouvelExercice.description
    };

    setExercices([...exercices, exercice]);
    setNouvelExercice({
      nom: '',
      series: '3',
      repetitions: '12',
      repos: '60',
      description: ''
    });
    setModalExerciceVisible(false);
  };

  const supprimerExercice = (id: string) => {
    setExercices(exercices.filter(exercice => exercice.id !== id));
  };

  const enregistrerProgramme = async () => {
    try {
      if (!nomProgramme) {
        Alert.alert("Erreur", "Le nom du programme est obligatoire.");
        return;
      }

      if (!utilisateurSelectionne) {
        Alert.alert("Erreur", "Veuillez sélectionner un utilisateur.");
        return;
      }

      if (exercices.length === 0) {
        Alert.alert("Erreur", "Ajoutez au moins un exercice au programme.");
        return;
      }

      setLoading(true);
      const auth = getAuth();
      const coach = auth.currentUser;

      if (!coach) {
        Alert.alert("Erreur", "Vous devez être connecté pour créer un programme.");
        return;
      }

      const promises = exercices.map(async (exercice) => {
        const exerciceData = {
          nom: exercice.nom,
          description: exercice.description || "",
          series: exercice.series,
          repetitions: exercice.repetitions,
          repos: exercice.repos,
          utilisateurId: `/utilisateurs/${utilisateurSelectionne.id}`,
          dateCreation: Timestamp.now(),
          statut: "actif",
          programmeNom: nomProgramme,
          programmeDuree: parseInt(dureeEnSemaines),
          programmeDescription: descriptionProgramme,
          coachId: coach.uid
        };

        return await addDoc(collection(db, 'programme'), exerciceData);
      });
      
      await Promise.all(promises);

      Alert.alert(
        "Succès", 
        "Le programme a été créé avec succès.", 
        [
          { 
            text: "OK", 
            onPress: () => {
              setNomProgramme('');
              setDescriptionProgramme('');
              setDureeEnSemaines('4');
              setExercices([]);
              setUtilisateurSelectionne(null);
            } 
          }
        ]
      );

    } catch (error) {
      console.error("Erreur lors de l'enregistrement du programme:", error);
      Alert.alert("Erreur", "Impossible d'enregistrer le programme.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Créer un Programme Personnalisé</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Sélectionner un client</Text>
          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={() => setModalUtilisateurVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {utilisateurSelectionne 
                ? utilisateurSelectionne.nomComplet 
                : "Sélectionner un client"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Informations du programme</Text>
          
          <Text style={styles.inputLabel}>Nom du programme*</Text>
          <TextInput
            style={styles.input}
            value={nomProgramme}
            onChangeText={setNomProgramme}
            placeholder="Ex: Programme de renforcement"
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descriptionProgramme}
            onChangeText={setDescriptionProgramme}
            placeholder="Description détaillée du programme..."
            multiline
          />

          <Text style={styles.inputLabel}>Durée (en semaines)</Text>
          <TextInput
            style={styles.input}
            value={dureeEnSemaines}
            onChangeText={setDureeEnSemaines}
            keyboardType="numeric"
            placeholder="Ex: 4"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Exercices</Text>
          
          {exercices.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucun exercice ajouté. Cliquez sur "Ajouter un exercice" ci-dessous.
            </Text>
          ) : (
            exercices.map((exercice, index) => (
              <View key={exercice.id} style={styles.exerciceItem}>
                <View style={styles.exerciceHeader}>
                  <Text style={styles.exerciceNom}>{index + 1}. {exercice.nom}</Text>
                  <TouchableOpacity onPress={() => supprimerExercice(exercice.id)}>
                    <Text style={styles.removeButton}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.exerciceDetails}>
                  <Text style={styles.exerciceDetail}>Séries: {exercice.series}</Text>
                  <Text style={styles.exerciceDetail}>Répétitions: {exercice.repetitions}</Text>
                  <Text style={styles.exerciceDetail}>Repos: {exercice.repos}s</Text>
                </View>
                {exercice.description ? (
                  <Text style={styles.exerciceDescription}>{exercice.description}</Text>
                ) : null}
              </View>
            ))
          )}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalExerciceVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Ajouter un exercice</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={enregistrerProgramme}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Enregistrement..." : "Enregistrer le programme"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalUtilisateurVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalUtilisateurVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un client</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom ou email..."
              value={rechercheUtilisateur}
              onChangeText={setRechercheUtilisateur}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : (
              <FlatList
                data={utilisateursFiltres}
                keyExtractor={(item) => item.id}
                style={styles.userList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userItem}
                    onPress={() => {
                      setUtilisateurSelectionne(item);
                      setModalUtilisateurVisible(false);
                    }}
                  >
                    <Text style={styles.userName}>{item.nomComplet}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalUtilisateurVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalExerciceVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalExerciceVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un exercice</Text>
            
            <Text style={styles.inputLabel}>Nom de l'exercice*</Text>
            <TextInput
              style={styles.input}
              value={nouvelExercice.nom}
              onChangeText={(text) => setNouvelExercice({...nouvelExercice, nom: text})}
              placeholder="Ex: Squat"
            />

            <View style={styles.rowInputs}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Séries</Text>
                <TextInput
                  style={styles.input}
                  value={nouvelExercice.series}
                  onChangeText={(text) => setNouvelExercice({...nouvelExercice, series: text})}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Répétitions</Text>
                <TextInput
                  style={styles.input}
                  value={nouvelExercice.repetitions}
                  onChangeText={(text) => setNouvelExercice({...nouvelExercice, repetitions: text})}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Repos (secondes)</Text>
            <TextInput
              style={styles.input}
              value={nouvelExercice.repos}
              onChangeText={(text) => setNouvelExercice({...nouvelExercice, repos: text})}
              keyboardType="numeric"
              placeholder="60"
            />

            <Text style={styles.inputLabel}>Instructions (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={nouvelExercice.description}
              onChangeText={(text) => setNouvelExercice({...nouvelExercice, description: text})}
              placeholder="Instructions pour l'exercice..."
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalExerciceVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={ajouterExercice}
              >
                <Text style={styles.confirmButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  exerciceItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  exerciceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciceNom: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    color: '#ef4444',
  },
  exerciceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  exerciceDetail: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  exerciceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
});