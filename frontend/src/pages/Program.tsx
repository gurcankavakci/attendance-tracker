import { useState } from 'react'
import { Plus, Trash2, Calendar, Clock, MapPin } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useScheduleSlots, addScheduleSlot, deleteScheduleSlot } from '../hooks/useSchedule'
import Modal from '../components/ui/Modal'
import { DAY_NAMES } from '../lib/dates'
import type { Course } from '../db/db'

const DAYS = [1, 2, 3, 4, 5, 6, 7]

const EMPTY_FORM = {
  courseId: 0,
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '10:00',
  location: '',
}

export default function Program() {
  const courses = useCourses()
  const slots = useScheduleSlots()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const courseMap = new Map<number, Course>(courses.map(c => [c.id!, c]))

  const slotsByDay = DAYS.map(day => ({
    day,
    slots: slots
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }))

  function openAdd(day?: number) {
    setForm({ ...EMPTY_FORM, courseId: courses[0]?.id ?? 0, dayOfWeek: day ?? 1 })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.courseId) return
    await addScheduleSlot(form)
    setShowModal(false)
  }

  async function handleDelete(id: number) {
    await deleteScheduleSlot(id)
    setDeleteId(null)
  }

  if (courses.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Haftalık Program</h1>
        <div className="card p-12 flex flex-col items-center text-center text-gray-400">
          <Calendar size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Önce ders ekleyin</p>
          <p className="text-sm mt-1">Program oluşturmak için önce Dersler sayfasından ders eklemelisiniz</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Haftalık Program</h1>
          <p className="text-sm text-gray-500 mt-0.5">Derslerin haftada hangi gün/saatte olduğunu girin</p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary">
          <Plus size={16} />
          Ders Saati Ekle
        </button>
      </div>

      {/* Weekly grid */}
      <div className="space-y-3">
        {slotsByDay.map(({ day, slots: daySlots }) => (
          <div key={day} className="card overflow-hidden">
            {/* Day header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-semibold text-gray-700 text-sm">{DAY_NAMES[day]}</span>
              <button
                onClick={() => openAdd(day)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus size={12} />
                Ekle
              </button>
            </div>

            {daySlots.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 italic">Ders yok</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {daySlots.map(slot => {
                  const course = courseMap.get(slot.courseId)
                  if (!course) return null
                  return (
                    <div key={slot.id} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">{course.name}</span>
                          {course.code && (
                            <span className="text-xs text-gray-400">{course.code}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {slot.startTime} – {slot.endTime}
                          </span>
                          {slot.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {slot.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteId(slot.id!)}
                        className="btn-ghost p-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <Modal title="Ders Saati Ekle" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ders *</label>
              <select
                className="input"
                value={form.courseId}
                onChange={e => setForm(f => ({ ...f, courseId: Number(e.target.value) }))}
                required
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gün *</label>
              <select
                className="input"
                value={form.dayOfWeek}
                onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
              >
                {DAYS.map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Başlangıç *</label>
                <input
                  type="time"
                  className="input"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Bitiş *</label>
                <input
                  type="time"
                  className="input"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Derslik (opsiyonel)</label>
              <input
                className="input"
                placeholder="Örn: A-101"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">İptal</button>
              <button type="submit" className="btn-primary flex-1">Ekle</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId != null && (
        <Modal title="Ders Saatini Sil" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-gray-600 mb-4">Bu ders saatini ve tüm yoklama kayıtlarını silmek istiyor musunuz?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">İptal</button>
            <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Sil</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
