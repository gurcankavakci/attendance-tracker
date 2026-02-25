import { useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { useCourses, addCourse, updateCourse, deleteCourse } from '../hooks/useCourses'
import Modal from '../components/ui/Modal'
import ColorPicker from '../components/ui/ColorPicker'
import type { Course } from '../db/db'

const EMPTY_FORM = { name: '', code: '', requiredPercent: 70, color: '#3B82F6' }

export default function Dersler() {
  const courses = useCourses()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setForm({ name: course.name, code: course.code, requiredPercent: course.requiredPercent, color: course.color })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing?.id != null) {
      await updateCourse(editing.id, form)
    } else {
      await addCourse(form)
    }
    setShowModal(false)
  }

  async function handleDelete(course: Course) {
    if (course.id != null) await deleteCourse(course.id)
    setDeleteConfirm(null)
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dersler</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ders ekle ve devam zorunluluğunu belirle</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} />
          Ders Ekle
        </button>
      </div>

      {/* Course list */}
      {courses.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center text-gray-400">
          <BookOpen size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Henüz ders eklenmedi</p>
          <p className="text-sm mt-1">İlk dersinizi eklemek için "Ders Ekle" butonuna tıklayın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="card p-4 flex items-center gap-4">
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: course.color }}
              />
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: course.color }}
              >
                {course.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{course.name}</span>
                  {course.code && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {course.code}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Devam zorunluluğu: <span className="font-medium text-gray-700">%{course.requiredPercent}</span>
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(course)} className="btn-ghost p-2">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteConfirm(course)} className="btn-ghost p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editing ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ders Adı *</label>
              <input
                className="input"
                placeholder="Örn: Matematik"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Ders Kodu (opsiyonel)</label>
              <input
                className="input"
                placeholder="Örn: MAT101"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Devam Zorunluluğu: %{form.requiredPercent}</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.requiredPercent}
                onChange={e => setForm(f => ({ ...f, requiredPercent: Number(e.target.value) }))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>%0</span>
                <span>%50</span>
                <span>%100</span>
              </div>
            </div>
            <div>
              <label className="label">Renk</label>
              <ColorPicker value={form.color} onChange={color => setForm(f => ({ ...f, color }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                İptal
              </button>
              <button type="submit" className="btn-primary flex-1">
                {editing ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Dersi Sil" onClose={() => setDeleteConfirm(null)} size="sm">
          <p className="text-gray-600 mb-4">
            <span className="font-semibold text-gray-900">{deleteConfirm.name}</span> dersini ve
            tüm yoklama kayıtlarını silmek istediğinize emin misiniz?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">İptal</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Sil</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
