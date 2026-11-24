import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { stripWebpMetadata } from './webp';

export async function convertImageToBase64(imagePath: string): Promise<string | undefined> {
  try {
    const base64Image = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64Image;
  } catch (error) {
    console.error("Error reading image as base64:", error);
  }
}

// The profile realm emits the value in an event, whose attributes are limited to this by the chain (see
// MaxEventAttrLen in gno). A longer value makes the transaction fail.
const MAX_AVATAR_LENGTH = 4096;

const AVATAR_HEIGHT = 96;

// Tried in order until the avatar is small enough.
const AVATAR_QUALITIES = [0.5, 0.35, 0.2, 0.1];

/** Make an avatar from the image, as a data URI which is small enough to be stored in the profile realm. */
export async function makeAvatarDataUri(imagePath: string): Promise<string> {
  for (const quality of AVATAR_QUALITIES) {
    const image = await ImageManipulator.manipulateAsync(imagePath, [{ resize: { height: AVATAR_HEIGHT } }], {
      compress: quality,
      format: ImageManipulator.SaveFormat.WEBP,
      base64: true,
    });
    if (!image.base64) continue;
    const dataUri = `data:image/webp;base64,${stripWebpMetadata(image.base64)}`;
    console.log("avatar length: %s, quality: %s", dataUri.length, quality);
    if (dataUri.length <= MAX_AVATAR_LENGTH) return dataUri;
  }

  throw new Error("This image is too detailed for an avatar. Please choose another one.");
}
