# Firestore Backup Scheduler - Firebase Extension

> Automatically exports your Firestore database to a Cloud Storage bucket on a configurable schedule. Set it once, get daily/hourly/weekly backups without any manual intervention.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Firebase Extension](https://img.shields.io/badge/Firebase-Extension-FFCA28?logo=firebase)](https://firebase.google.com/products/extensions)

## Why Use This Extension?

Firestore doesn't offer built-in scheduled backups. If something goes wrong — accidental bulk delete, bad migration, or data corruption — you need a recent backup to recover. This extension automates the entire process using the Firestore Export API and Cloud Scheduler.

- **Fully automated** — backups run on a cron schedule you define
- **Flexible schedule** — hourly, daily, weekly, or any cron expression
- **Selective exports** — back up the entire database or only specific collections
- **Timestamped** — each backup gets a unique folder with ISO timestamp
- **Audit log** — optional Firestore collection logs every backup run (success or failure)
- **Restorable** — standard Firestore export format, restore with `gcloud firestore import`

## How It Works

```
1. Cloud Scheduler triggers the function on schedule (e.g., daily at 2am)
2. Function calls Firestore Export API
   -> gs://your-bucket/firestore-backup-2025-01-15T02-00-00-000Z/
3. Backup log written to _ext_backup_logs (optional)
```

## Installation

### Option 1: Firebase CLI

```
firebase ext:install aaronat1/firestore-backup-scheduler --project=YOUR_PROJECT_ID
```

### Option 2: From Source

```bash
git clone https://github.com/aaronat1/backup_extension_firebase.git
cd backup_extension_firebase
firebase ext:install . --project=YOUR_PROJECT_ID
```

### Prerequisites

Before installing, grant the required IAM roles to the Cloud Functions service account:

```bash
PROJECT_ID=your-project-id
SA="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/datastore.importExportAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/storage.admin"
```

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions deployment region | `us-central1` |
| `BACKUP_BUCKET` | GCS bucket URI (e.g., `gs://my-backups`) | _(required)_ |
| `BACKUP_SCHEDULE` | Cron or App Engine schedule string | `every 24 hours` |
| `BACKUP_TIMEZONE` | IANA timezone (e.g., `Europe/Madrid`) | `UTC` |
| `COLLECTIONS_TO_BACKUP` | Comma-separated collections (empty = all) | _(empty)_ |
| `BACKUP_LOG_COLLECTION` | Firestore collection for backup logs | `_ext_backup_logs` |

## Schedule Examples

| Schedule | Expression |
|----------|-----------|
| Every 24 hours | `every 24 hours` |
| Daily at 2am | `every day 02:00` |
| Every 6 hours | `every 6 hours` |
| Weekly on Sunday midnight | `0 0 * * 0` |
| Every weekday at 3am | `0 3 * * 1-5` |

## Restoring from a Backup

```bash
gcloud firestore import gs://your-bucket/firestore-backup-2025-01-15T02-00-00-000Z
```

## Backup Log Format

Each run creates a document in `_ext_backup_logs`:

```json
{
  "status": "success",
  "outputUriPrefix": "gs://my-backups/firestore-backup-2025-01-15T02-00-00-000Z",
  "collectionIds": "all",
  "operationName": "projects/my-project/databases/(default)/operations/abc123",
  "errorMessage": null,
  "triggeredAt": "2025-01-15T02:00:00.000Z"
}
```

## Tech Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript
- **Trigger:** Cloud Pub/Sub Schedule (`pubsub.schedule`)
- **Dependencies:** `firebase-admin`, `firebase-functions`, `google-auth-library`

## Billing

Blaze plan required. Costs include Cloud Functions invocations, Cloud Scheduler jobs, Firestore export operations, and Cloud Storage usage for stored backups. See [Firebase Pricing](https://firebase.google.com/pricing).

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

## Author

**[@aaronat1](https://github.com/aaronat1)**
