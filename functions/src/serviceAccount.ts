/** Cloud Functions runtime SA — must have Firestore access (not default compute). */
export function getServiceAccount(): string {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  return projectId === 'joystie-poc-prod'
    ? 'firebase-adminsdk-fbsvc@joystie-poc-prod.iam.gserviceaccount.com'
    : 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com';
}
