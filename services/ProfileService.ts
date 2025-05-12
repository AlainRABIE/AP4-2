import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import app from "../firebase/firebaseConfig";

export class ProfileService {
  private db = getFirestore(app);
  private auth = getAuth(app);

  async getUserData(userId: string): Promise<any> {
    try {
      const userRef = doc(this.db, "utilisateurs", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error("Aucune donnée utilisateur trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      throw error;
    }
  }

  async updateUserField(userId: string, fieldName: string, newValue: string): Promise<void> {
    try {
      const userRef = doc(this.db, "utilisateurs", userId);
      
      let processedValue: any = newValue;
      if (fieldName === "poids" || fieldName === "taille" || fieldName === "caloriesNecessaires") {
        processedValue = parseFloat(newValue);
      } else if (fieldName === "age") {
        processedValue = parseInt(newValue, 10);
      }
      
      await updateDoc(userRef, {
        [fieldName]: processedValue,
        derniereModification: new Date()
      });
      
      console.log(`Champ ${fieldName} mis à jour avec succès.`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
      throw err;
    }
  }

  calculateBMI(weight: string | number, height: string | number): { 
    bmi: string; 
    category: string; 
    color: string;
  } {
    const weightNum = parseFloat(String(weight));
    const heightNum = parseFloat(String(height)) / 100;
    
    if (!weightNum || !heightNum) {
      return { bmi: "", category: "", color: "" };
    }
    
    const bmi = weightNum / (heightNum * heightNum);
    const bmiString = bmi.toFixed(1);
    
    let category = "";
    let color = "";
    
    if (bmi < 18.5) {
      category = "Insuffisance pondérale";
      color = "#2D9CDB";
    } else if (bmi < 25) {
      category = "Poids normal";
      color = "#27AE60";
    } else if (bmi < 30) {
      category = "Surpoids";
      color = "#F2994A";
    } else {
      category = "Obésité";
      color = "#EB5757";
    }
    
    return { bmi: bmiString, category, color };
  }
}

export default new ProfileService();
