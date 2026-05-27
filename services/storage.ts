import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

/**
 * Uploads a locally captured/picked photo to Firebase Storage and returns its
 * download URL. Stored under users/{uid}/{tripId}/{entryId}.jpg so storage
 * rules can isolate per-user files.
 */
export async function uploadEntryPhoto(
  uid: string,
  tripId: string,
  entryId: string,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const objectRef = ref(storage, `users/${uid}/${tripId}/${entryId}.jpg`);
  await uploadBytes(objectRef, blob);
  return getDownloadURL(objectRef);
}

export async function deleteEntryPhoto(
  uid: string,
  tripId: string,
  entryId: string,
): Promise<void> {
  try {
    await deleteObject(ref(storage, `users/${uid}/${tripId}/${entryId}.jpg`));
  } catch {
    // Photo may not exist; deletion is best-effort.
  }
}
