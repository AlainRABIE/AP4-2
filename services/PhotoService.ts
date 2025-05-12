import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

export class PhotoService {
  private db = getFirestore();
  private storage = getStorage();
  
  async requestMediaLibraryPermission(): Promise<boolean> {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permissionResult.granted;
  }
  
  async pickImage(): Promise<ImagePicker.ImagePickerResult> {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  }
  
  async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
    const storageRef = ref(this.storage, `avatars/${userId}.jpg`);
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    const userRef = doc(this.db, "utilisateurs", userId);
    await updateDoc(userRef, { urlAvatar: downloadURL });
    
    return downloadURL;
  }
}

export default new PhotoService();
