import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { GoogleAuth } from "google-auth-library";

admin.initializeApp();

const BACKUP_BUCKET = process.env.BACKUP_BUCKET ?? "";
const COLLECTIONS_RAW = process.env.COLLECTIONS_TO_BACKUP ?? "";
const BACKUP_LOG_COLLECTION = process.env.BACKUP_LOG_COLLECTION ?? "_ext_backup_logs";
const PROJECT_ID = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG ?? "{}").projectId
  : "";

async function runExport(): Promise<void> {
  if (!BACKUP_BUCKET) {
    functions.logger.error("BACKUP_BUCKET is not configured. Skipping backup.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputUriPrefix = `${BACKUP_BUCKET}/firestore-backup-${timestamp}`;

  const collectionIds = COLLECTIONS_RAW
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const body: Record<string, unknown> = { outputUriPrefix };
  if (collectionIds.length > 0) {
    body.collectionIds = collectionIds;
  }

  functions.logger.info("Starting Firestore export", { outputUriPrefix, collectionIds });

  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const projectId = PROJECT_ID || await auth.getProjectId();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;

  let status = "success";
  let errorMessage: string | undefined;
  let operationName: string | undefined;

  try {
    const response = await client.request<{ name?: string }>({ url, method: "POST", data: body });
    operationName = response.data?.name;
    functions.logger.info("Firestore export started successfully", { operationName, outputUriPrefix });
  } catch (err: unknown) {
    status = "error";
    errorMessage = err instanceof Error ? err.message : String(err);
    functions.logger.error("Firestore export failed", { err, outputUriPrefix });
  }

  if (BACKUP_LOG_COLLECTION) {
    try {
      await admin.firestore().collection(BACKUP_LOG_COLLECTION).add({
        status,
        outputUriPrefix,
        collectionIds: collectionIds.length > 0 ? collectionIds : "all",
        operationName: operationName ?? null,
        errorMessage: errorMessage ?? null,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logErr) {
      functions.logger.error("Failed to write backup log", { logErr });
    }
  }
}

export const scheduledBackup = functions.pubsub
  .schedule(process.env.BACKUP_SCHEDULE ?? "every 24 hours")
  .timeZone(process.env.BACKUP_TIMEZONE ?? "UTC")
  .onRun(async () => {
    await runExport();
    return null;
  });
