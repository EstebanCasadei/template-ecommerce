import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '../../../shared/firebase/firebase.js'

function requireDb() {
  if (!db) throw new Error('Admin operations require a configured Firebase project.')
  return db
}

/** Slug doubles as document id so category renames are explicit re-creates. */
export function slugifyCategory(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

export function createCategory(name) {
  const slug = slugifyCategory(name)
  if (!slug) throw new Error('Category name is required.')
  return setDoc(doc(requireDb(), 'categories', slug), { name: name.trim() })
}

export function deleteCategory(id) {
  return deleteDoc(doc(requireDb(), 'categories', id))
}
