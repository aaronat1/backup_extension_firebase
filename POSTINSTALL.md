# Firestore Backup Scheduler — Setup Complete

Automated backups are now scheduled.

**Schedule:** `${param:BACKUP_SCHEDULE}` (`${param:BACKUP_TIMEZONE}`)
**Destination:** `${param:BACKUP_BUCKET}`
**Collections:** `${param:COLLECTIONS_TO_BACKUP}` _(empty = full database)_

## Check Backup Logs

```js
const logs = await db
  .collection("${param:BACKUP_LOG_COLLECTION}")
  .orderBy("triggeredAt", "desc")
  .limit(10)
  .get();

logs.forEach(doc => {
  const { status, outputUriPrefix, triggeredAt } = doc.data();
  console.log(status, outputUriPrefix, triggeredAt.toDate());
});
```

## Restore from Backup

To restore data from a backup, use the Firebase CLI:

```bash
gcloud firestore import gs://your-bucket/firestore-backup-2024-01-15T02-00-00-000Z
```

## Support

[GitHub repository](https://github.com/aaronat1/firestore-backup-scheduler)
