import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'

/**
 * Admin product writes. These succeed only when the signed-in user carries
 * the `admin` custom claim — firestore.rules rejects everyone else, so this
 * module contains no client-side permission logic.
 */

function requireDb() {
  if (!db) throw new Error('Admin operations require a configured Firebase project.')
  return db
}

export function createProduct(product) {
  return addDoc(collection(requireDb(), 'products'), product)
}

export function updateProduct(id, product) {
  return updateDoc(doc(requireDb(), 'products', id), product)
}

export function deleteProduct(id) {
  return deleteDoc(doc(requireDb(), 'products', id))
}
