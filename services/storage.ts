import { apiUpload } from './api';

/**
 * Photo "storage" now means: POST the local file to the backend, which writes
 * it under `data/photos/<uuid>.jpg` and returns the public path the app should
 * persist on the entry/trip. These names are kept (saveEntryPhoto / saveTripCover
 * / deleteEntryPhoto) so the form components don't have to change.
 */

interface UploadResponse {
  photoUrl: string;
}

function fileForm(localUri: string, name: string): FormData {
  const form = new FormData();
  // React Native's FormData accepts file objects of this shape (not Blob).
  form.append('file', { uri: localUri, name, type: 'image/jpeg' } as unknown as Blob);
  return form;
}

export async function saveEntryPhoto(
  _uid: string,
  tripId: string,
  entryId: string,
  localUri: string,
): Promise<string> {
  const data = await apiUpload<UploadResponse>(
    `/trips/${tripId}/entries/${entryId}/photo`,
    fileForm(localUri, `${entryId}.jpg`),
  );
  return data.photoUrl;
}

export async function saveTripCover(
  _uid: string,
  tripId: string,
  localUri: string,
): Promise<string> {
  const data = await apiUpload<UploadResponse>(
    `/trips/${tripId}/cover`,
    fileForm(localUri, `cover-${tripId}.jpg`),
  );
  return data.photoUrl;
}

/**
 * Removing a photo from an entry happens implicitly via PATCH photoUrl=''.
 * Old photo files orphaned by edits are cleaned up on trip delete (cascade).
 */
export async function deleteEntryPhoto(
  _uid: string,
  _tripId: string,
  _entryId: string,
): Promise<void> {
  // no-op
}
