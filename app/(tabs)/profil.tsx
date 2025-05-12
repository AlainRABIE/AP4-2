import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../services/UserContext";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import profileService from "../../services/ProfileService";
import photoService from "../../services/PhotoService";
import { styles } from "../../style/profil/profilStyles";

const StatCard = React.memo(({ value, label }: { value: string | number | undefined, label: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value || "--"}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

const EditableField = React.memo(({
  iconName,
  label,
  value,
  suffix = "",
  onPress
}: {
  iconName: any,
  label: string,
  value: string | number | undefined,
  suffix?: string,
  onPress?: () => void
}) => (
  <TouchableOpacity style={styles.editableField} onPress={onPress}>
    <View style={styles.fieldIconContainer}>
      <Ionicons name={iconName} size={20} color="#0575E6" />
    </View>
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {value ? `${value}${suffix}` : "Non renseigné"}
      </Text>
    </View>
    {onPress && <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />}
  </TouchableOpacity>
));

const BMICard = React.memo(({ bmi, category, color }: { bmi: string, category: string, color: string }) => (
  <View style={styles.bmiCard}>
    <View style={styles.bmiHeader}>
      <Text style={styles.bmiTitle}>Indice de Masse Corporelle</Text>
      <Text style={[styles.bmiValue, { color }]}>{bmi}</Text>
    </View>
    <Text style={[styles.bmiCategory, { color }]}>{category}</Text>
    <View style={styles.bmiScale}>
      <View style={[styles.bmiIndicator, { left: `${Math.min(Math.max(parseFloat(bmi) * 2.5, 0), 100)}%` }]} />
      <View style={styles.bmiRanges}>
        <View style={[styles.bmiRange, { backgroundColor: '#2D9CDB' }]} />
        <View style={[styles.bmiRange, { backgroundColor: '#27AE60' }]} />
        <View style={[styles.bmiRange, { backgroundColor: '#F2994A' }]} />
        <View style={[styles.bmiRange, { backgroundColor: '#EB5757' }]} />
      </View>
      <View style={styles.bmiLabels}>
        <Text style={styles.bmiLabel}>18.5</Text>
        <Text style={styles.bmiLabel}>25</Text>
        <Text style={styles.bmiLabel}>30</Text>
      </View>
    </View>
  </View>
));

const ViewProfilePage: React.FC = () => {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<
    "nomComplet" | "departement" | "poids" | "age" | "taille" | "sexe" | "niveauActivite"
  >("nomComplet");
  const [newValue, setNewValue] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    const loadUserData = async () => {
      if (user && user.uid) {
        try {
          console.log("Chargement des données utilisateur pour UID:", user.uid);
          const userData = await profileService.getUserData(user.uid);
          console.log("Données utilisateur récupérées:", userData);
          
          if (userData) {
            setUser({
              ...user,
              nomComplet: userData.nomComplet,
              poids: userData.poids,
              taille: userData.taille,
              age: userData.age,
              sexe: userData.sexe,
              niveauActivite: userData.niveauActivite,
              caloriesNecessaires: userData.caloriesNecessaires,
              urlAvatar: userData.urlAvatar
            });
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données utilisateur:", error);
        }
      }
    };
    
    loadUserData();
  }, []);

  const bmiData = useMemo(() => {
    if (user?.poids && user?.taille) {
      return profileService.calculateBMI(user.poids, user.taille);
    }
    return { bmi: null, category: "", color: "" };
  }, [user?.poids, user?.taille]);

  const handleLogout = useCallback(async () => {
    try {
      await profileService.signOut();
      router.replace("../(auth)/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  }, [router]);

  const handleEdit = useCallback((field: "nomComplet" | "departement" | "poids" | "age" | "taille" | "sexe" | "niveauActivite") => {
    setFieldToEdit(field);
    setNewValue(String(user?.[field] || ""));
    setModalVisible(true);
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    try {
      await profileService.updateUserField(user.uid, fieldToEdit, newValue);
      setUser({ ...user, [fieldToEdit]: newValue });
      setModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  }, [user, fieldToEdit, newValue, setUser]);

  const handleChangePhoto = useCallback(async () => {
    if (!user || !user.uid) return;

    try {
      const hasPermission = await photoService.requestMediaLibraryPermission();
      if (!hasPermission) {
        alert("Permission d'accès à la bibliothèque requise !");
        return;
      }

      const pickerResult = await photoService.pickImage();
      if (!pickerResult.canceled) {
        const downloadURL = await photoService.uploadProfilePhoto(
          user.uid,
          pickerResult.assets[0].uri
        );
        setUser({ ...user, urlAvatar: downloadURL });
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la photo :", error);
      alert(`Erreur : ${error.message || "Une erreur inconnue s'est produite"}`);
    }
  }, [user, setUser]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Aucun utilisateur connecté.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#0575E6', '#021B79']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={handleChangePhoto}>
                  <Image
                    source={{ uri: user.urlAvatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerName}>{user.nomComplet || "Utilisateur"}</Text>
              <Text style={styles.headerEmail}>{user.email}</Text>

              <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout}>
                <Text style={styles.headerLogoutText}>Déconnexion</Text>
                <Ionicons name="log-out-outline" size={18} color="#FFF" />
              </TouchableOpacity>

              <Link href="/(reglage)/setting" asChild>
                <TouchableOpacity style={styles.settingsButton}>
                  <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </Link>
            </View>
          </LinearGradient>

          <View style={styles.statsContainer}>
            <StatCard value={user.poids} label="kg" />
            <StatCard value={user.taille} label="cm" />
            <StatCard value={user.age} label="ans" />
          </View>

          {bmiData.bmi && (
            <BMICard
              bmi={bmiData.bmi}
              category={bmiData.category}
              color={bmiData.color}
            />
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>

            <EditableField
              iconName="person"
              label="Nom complet"
              value={user.nomComplet}
              onPress={() => handleEdit("nomComplet")}
            />

            <EditableField
              iconName="mail"
              label="Email"
              value={user.email}
            />

            <EditableField
              iconName="fitness"
              label="Poids"
              value={user.poids}
              suffix=" kg"
              onPress={() => handleEdit("poids")}
            />

            <EditableField
              iconName="resize"
              label="Taille"
              value={user.taille}
              suffix=" cm"
              onPress={() => handleEdit("taille")}
            />

            <EditableField
              iconName="calendar"
              label="Âge"
              value={user.age}
              suffix=" ans"
              onPress={() => handleEdit("age")}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Objectif nutritionnel</Text>

            <EditableField
              iconName="flame"
              label="Niveau d'activité"
              value={user.niveauActivite}
              onPress={() => handleEdit("niveauActivite")}
            />

            <View style={styles.caloriesCard}>
              <View style={styles.caloriesContent}>
                <Text style={styles.caloriesTitle}>Besoins caloriques journaliers</Text>
                <Text style={styles.caloriesValue}>{user.caloriesNecessaires || "--"}</Text>
                <Text style={styles.caloriesUnit}>calories/jour</Text>
              </View>
              <View style={styles.caloriesIcon}>
                <Ionicons name="nutrition" size={40} color="#0575E6" />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  Modifier {
                    fieldToEdit === "nomComplet" ? "le nom" :
                      fieldToEdit === "departement" ? "le département" :
                        fieldToEdit === "poids" ? "le poids" :
                          fieldToEdit === "taille" ? "la taille" :
                            fieldToEdit === "niveauActivite" ? "le niveau d'activité" :
                              "l'âge"
                  }
                </Text>
                <TextInput
                  style={styles.input}
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder={`Entrez ${fieldToEdit === "poids" ? "votre poids en kg" :
                    fieldToEdit === "age" ? "votre âge" :
                      fieldToEdit === "taille" ? "votre taille en cm" :
                        fieldToEdit === "niveauActivite" ? "votre niveau d'activité" :
                          `un nouveau ${fieldToEdit}`
                    }`}
                  keyboardType={fieldToEdit === "poids" || fieldToEdit === "age" || fieldToEdit === "taille" ? "numeric" : "default"}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveText}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewProfilePage;