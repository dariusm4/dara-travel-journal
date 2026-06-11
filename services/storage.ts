import { Directory, File, Paths } from 'expo-file-system';

/**
 * Photos are stored on the device under the app's persistent document
 * directory. The Firestore entry/trip references the resulting `file://` URI,
 * so photos survive app restarts (they're lost on uninstall, which is the
 * accepted trade-off for keeping the project free-tier and infra-free).
 */

const PHOTOS_DIR = new Directory(Paths.document, 'dara', 'photos');
const COVERS_DIR = new Directory(Paths.document, 'dara', 'covers');

function ensure(dir: Directory): void {
  if (!dir.exists) dir.create({ intermediates: true });
}

function persist(srcUri: string, dest: File): string {
  if (dest.exists) dest.delete();
  const src = new File(srcUri);
  src.copy(dest);
  return dest.uri;
}

/** Copies a picked entry photo into persistent storage and returns its URI. */
export async function saveEntryPhoto(
  _uid: string,
  tripId: string,
  entryId: string,
  localUri: string,
): Promise<string> {
  ensure(PHOTOS_DIR);
  return persist(localUri, new File(PHOTOS_DIR, `${tripId}_${entryId}.jpg`));
}

/** Copies a picked trip cover photo into persistent storage and returns its URI. */
export async function saveTripCover(
  _uid: string,
  tripId: string,
  localUri: string,
): Promise<string> {
  ensure(COVERS_DIR);
  return persist(localUri, new File(COVERS_DIR, `${tripId}.jpg`));
}

/** Removes an entry's stored photo, if present. Safe to call when missing. */
export async function deleteEntryPhoto(
  _uid: string,
  tripId: string,
  entryId: string,
): Promise<void> {
  const file = new File(PHOTOS_DIR, `${tripId}_${entryId}.jpg`);
  if (file.exists) file.delete();
}
