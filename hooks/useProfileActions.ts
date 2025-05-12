import { useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { useUser } from "../services/UserContext";
import profileService from "../services/ProfileService";
import photoService from "../services/PhotoService";
import { Alert } from "react-native";

type FieldToEdit = "nomComplet" | "departement" | "poids" | "age" | "taille" | "sexe" | "niveauActivite";

export const useProfileActions = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<FieldToEdit>("nomComplet");
  const [newValue, setNewValue] = useState("");

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

  const handleEdit = useCallback((field: FieldToEdit) => {
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
        Alert.alert("Permission requise", "Permission d'accès à la bibliothèque requise !");
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
      Alert.alert("Erreur", `${error.message || "Une erreur inconnue s'est produite"}`);
    }
  }, [user, setUser]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    user,
    modalVisible,
    fieldToEdit,
    newValue,
    bmiData,
    setNewValue,
    handleLogout,
    handleEdit,
    handleSave,
    handleChangePhoto,
    closeModal
  };
};
