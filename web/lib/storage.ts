import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

// Upload file
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

// Upload user file
export async function uploadUserFile(
  userId: string,
  file: File,
  fileName?: string
): Promise<string> {
  const name = fileName || `${Date.now()}_${file.name}`;
  const path = `users/${userId}/${name}`;
  return uploadFile(file, path);
}

// Get file URL
export async function getFileURL(path: string): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

// Delete file
export async function deleteFile(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// List user files
export async function listUserFiles(userId: string) {
  const storage = getFirebaseStorage();
  const listRef = ref(storage, `users/${userId}`);
  const result = await listAll(listRef);
  
  const files = await Promise.all(
    result.items.map(async (item) => ({
      name: item.name,
      path: item.fullPath,
      url: await getDownloadURL(item),
    }))
  );
  
  return files;
}
