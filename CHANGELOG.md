## Version 0.1.3

- Fix: add `datastore.user` role so the service account can write backup logs to Firestore.
- Fix: operator precedence bug in PROJECT_ID resolution.

## Version 0.1.2

- Upgrade Node.js engine from 18 to 20.
- Add `stage: stable` to extension.yaml.

## Version 0.1.1

- Fix: set Node.js engine to 18 for Cloud Build compatibility.
- Add package-lock.json for reproducible builds.

## Version 0.1.0

- Initial release.
- Scheduled Firestore exports to Cloud Storage via the Firestore Admin Export API.
- Supports full database exports or selective collection exports.
- Configurable schedule (App Engine cron format or standard cron).
- Configurable timezone.
- Optional backup log written to a Firestore collection.
- Uses `google-auth-library` for authenticated API calls.
