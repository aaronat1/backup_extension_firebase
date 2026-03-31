# Firestore Backup Scheduler

This extension automatically exports your Firestore database (or specific collections) to a Cloud Storage bucket on a configurable schedule using the Firestore Admin Export API.

## Prerequisites

- A Firebase project with Firestore and Cloud Storage enabled.
- A Cloud Storage bucket for storing exports. The Cloud Functions service account must have **Storage Admin** (`storage.admin`) and **Firestore Import/Export Admin** (`datastore.importExportAdmin`) roles.
- Cloud Scheduler API enabled in your Google Cloud project.

## Grant Required Permissions

Run this command to grant the service account the necessary roles:

```bash
PROJECT_ID=your-project-id
SA="firebase-adminsdk@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/datastore.importExportAdmin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/storage.admin"
```

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions region | `us-central1` |
| `BACKUP_BUCKET` | GCS bucket URI (e.g. `gs://my-backups`) | _(required)_ |
| `BACKUP_SCHEDULE` | Cron or App Engine schedule string | `every 24 hours` |
| `BACKUP_TIMEZONE` | IANA timezone for the schedule | `UTC` |
| `COLLECTIONS_TO_BACKUP` | Comma-separated collections (empty = all) | _(empty)_ |
| `BACKUP_LOG_COLLECTION` | Firestore collection for backup logs | `_ext_backup_logs` |

## Billing

This extension uses Cloud Functions, Cloud Scheduler, and Cloud Storage. See [Firebase Pricing](https://firebase.google.com/pricing) for details.
