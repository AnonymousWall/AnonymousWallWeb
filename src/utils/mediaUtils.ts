import { API_ENDPOINTS } from '../config/constants';

/**
 * Returns the API path used to fetch a media object via the authenticated
 * /media proxy endpoint.
 *
 * - Object names returned by the backend after the OCI bucket became private
 *   (e.g. "posts/uuid.jpg") are converted to "/media/posts/uuid.jpg".
 * - Legacy full URLs (http/https) that may exist in older data are returned
 *   unchanged so they continue to load without modification.
 */
export function getMediaUrl(objectNameOrUrl: string): string {
  if (objectNameOrUrl.startsWith('http://') || objectNameOrUrl.startsWith('https://')) {
    return objectNameOrUrl;
  }

  const objectName = objectNameOrUrl.startsWith('/') ? objectNameOrUrl.slice(1) : objectNameOrUrl;

  return API_ENDPOINTS.MEDIA(objectName);
}
