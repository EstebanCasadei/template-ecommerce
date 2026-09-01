/**
 * Grants or revokes the `admin` custom claim for a Firebase Auth user.
 *
 * The claim is embedded in the user's signed ID token, so it cannot be
 * forged or self-assigned from the browser. firestore.rules checks
 * `request.auth.token.admin == true` for every privileged operation.
 *
 * Requirements (one-time):
 *   1. Firebase Console → Project settings → Service accounts →
 *      "Generate new private key". Save the JSON OUTSIDE the repo or as
 *      ./serviceAccountKey.json (git-ignored).
 *   2. pnpm add -D firebase-admin   (already listed in devDependencies)
 *
 * Usage:
 *   node scripts/set-admin.js admin@store.com
 *   node scripts/set-admin.js admin@store.com --remove
 *
 * The service account path can be overridden with the
 * GOOGLE_APPLICATION_CREDENTIALS environment variable.
 *
 * Note: the user must sign out and back in (or force-refresh their token)
 * for the change to take effect.
 */
import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const [email, flag] = process.argv.slice(2)
if (!email) {
  console.error('Usage: node scripts/set-admin.js <email> [--remove]')
  process.exit(1)
}

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './serviceAccountKey.json'
if (!existsSync(keyPath)) {
  console.error(
    `Service account key not found at ${keyPath}.\n` +
      'Download it from Firebase Console → Project settings → Service accounts,\n' +
      'save it as ./serviceAccountKey.json (git-ignored) or set GOOGLE_APPLICATION_CREDENTIALS.',
  )
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })

const auth = getAuth()
const remove = flag === '--remove'

try {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, remove ? { admin: null } : { admin: true })
  console.log(`${remove ? 'Revoked' : 'Granted'} admin for ${email} (uid: ${user.uid}).`)
  console.log('The user must sign out and back in for the change to take effect.')
} catch (err) {
  console.error(`Failed: ${err.message}`)
  process.exit(1)
}
