import { useState } from 'react'
import { BarChart3, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Calendar, Settings, Trash2 } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useScheduleSlots } from '../hooks/useSchedule'
import { useAllAttendanceRecords } from '../hooks/useAttendance'
import { useSemester, setSemester, clearSemester, type SemesterSettings } from '../hooks/useSemester'
import { calcCourseStats, getAllWeeksWithRecords, buildSemesterWeeks } from '../lib/attendance'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import type { CourseStats } from '../lib/attendance'

const currentYear = new Date().getFullYear()

export default function Rapor() {
  const courses = useCourses()
  const slots = useScheduleSlots()
  const records = useAllAttendanceRecords()
  const semester = useSemester()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showSemesterModal, setShowSemesterModal] = useState(false)

  const semesterWeeks = semester
    ? buildSemesterWeeks(semester.startWeek, semester.startYear, semester.endWeek, semester.endYear)
    : getAllWeeksWithRecords(records)

  if (courses.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapor</h1>
        <div className="card p-12 flex flex-col items-center text-center text-gray-400">
          <BarChart3 size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Henüz ders eklenmedi</p>
        </div>
      </div>
    )
  }

  if (!semester && semesterWeeks.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapor</h1>
        <SemesterCard semester={null} weekCount={0} onEdit={() => setShowSemesterModal(true)} />
        <div className="card p-12 flex flex-col items-center text-center text-gray-400 mt-4">
          <Calendar size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Yoklama verisi yok</p>
          <p className="text-sm mt-1">Dönem ayarlayın veya Yoklama sayfasından derslerinizi işaretleyin</p>
        </div>
        {showSemesterModal && (
          <SemesterModal semester={semester} onClose={() => setShowSemesterModal(false)} />
        )}
      </div>
    )
  }

  const stats = courses.map(course =>
    calcCourseStats(course.id!, course.requiredPercent, slots, records, semesterWeeks)
  )

  const passing = stats.filter(s => s.status === 'pass').length
  const failing = stats.filter(s => s.status === 'fail').length
  const atRisk = stats.filter(s => s.status === 'risk').length

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rapor</h1>
        <p className="text-sm text-gray-500 mt-0.5">Devam durumu ve geçme/kalma özeti</p>
      </div>

      {/* Semester settings */}
      <SemesterCard
        semester={semester}
        weekCount={semesterWeeks.length}
        onEdit={() => setShowSemesterModal(true)}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
        <SummaryCard
          count={passing}
          label="Geçiyor"
          color="text-green-700 bg-green-50 border-green-200"
          icon={<CheckCircle2 size={18} className="text-green-600" />}
        />
        <SummaryCard
          count={atRisk}
          label="Riskli"
          color="text-yellow-700 bg-yellow-50 border-yellow-200"
          icon={<AlertTriangle size={18} className="text-yellow-600" />}
        />
        <SummaryCard
          count={failing}
          label="Kalıyor"
          color="text-red-700 bg-red-50 border-red-200"
          icon={<XCircle size={18} className="text-red-600" />}
        />
      </div>

      {/* Course details */}
      <div className="space-y-3">
        {courses.map((course, i) => {
          const stat = stats[i]
          const isExpanded = expanded === course.id
          return (
            <div key={course.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : course.id!)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: course.color }}
                >
                  {course.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{course.name}</span>
                    {course.code && <span className="text-xs text-gray-400">{course.code}</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Gerekli: %{course.requiredPercent} · Mevcut: %{stat.currentPercent}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge stat={stat} />
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              <div className="px-4 pb-3">
                <ProgressBar percent={stat.currentPercent} required={course.requiredPercent} color={course.color} />
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox label="Toplam Ders" value={stat.totalClasses} />
                    <StatBox label="Katıldı" value={stat.attended} color="text-green-700" />
                    <StatBox label="Katılmadı" value={stat.absent} color="text-red-700" />
                    <StatBox label="Mevcut %" value={`%${stat.currentPercent}`} color={stat.currentPercent >= course.requiredPercent ? 'text-green-700' : 'text-red-700'} />
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-white border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-1">En Kötü Senaryo (kalan tüm dersler devamsız)</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">%{stat.worstCasePercent}</span>
                      <StatusBadge stat={{ ...stat, status: stat.worstCaseStatus }} />
                    </div>
                  </div>
                  {stat.status === 'fail' && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs text-red-700 font-medium">
                        Bu dersten devam koşulunu karşılayamıyorsunuz. Gerekli: %{course.requiredPercent}, Mevcut: %{stat.currentPercent}
                      </p>
                    </div>
                  )}
                  {stat.status === 'risk' && (
                    <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-medium">
                        Dikkat: Devam oranınız gerekli sınırın çok yakınında. Lütfen derslere devam edin.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showSemesterModal && (
        <SemesterModal semester={semester} onClose={() => setShowSemesterModal(false)} />
      )}
    </div>
  )
}

// ─── Semester card ────────────────────────────────────────────────────────────

function SemesterCard({
  semester,
  weekCount,
  onEdit,
}: {
  semester: SemesterSettings | null
  weekCount: number
  onEdit: () => void
}) {
  async function handleClear() {
    await clearSemester()
  }

  return (
    <div className="card px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-blue-500 flex-shrink-0" />
        {semester ? (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {semester.startYear} · {semester.startWeek}. hafta
              {' → '}
              {semester.endYear} · {semester.endWeek}. hafta
            </p>
            <p className="text-xs text-gray-500">Toplam {weekCount} ders haftası</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-500">Dönem belirlenmedi</p>
            <p className="text-xs text-gray-400">Gelecek dersler hesaba katılmıyor</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit} className="btn-ghost p-2 text-gray-500" title="Düzenle">
          <Settings size={15} />
        </button>
        {semester && (
          <button onClick={handleClear} className="btn-ghost p-2 text-red-400 hover:bg-red-50" title="Sil">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Semester modal ───────────────────────────────────────────────────────────

function SemesterModal({ semester, onClose }: { semester: SemesterSettings | null; onClose: () => void }) {
  const [form, setForm] = useState<SemesterSettings>(
    semester ?? { startWeek: 1, startYear: currentYear, endWeek: 16, endYear: currentYear }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await setSemester(form)
    onClose()
  }

  function setField(field: keyof SemesterSettings, value: number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  return (
    <Modal title="Dönem Ayarları" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Dönem Başlangıcı</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="number"
                className="input text-center"
                min={1}
                max={53}
                value={form.startWeek}
                onChange={e => setField('startWeek', Number(e.target.value))}
                required
              />
              <p className="text-xs text-gray-400 text-center mt-1">Hafta</p>
            </div>
            <span className="text-gray-400 text-sm pb-5">·</span>
            <div className="flex-1">
              <input
                type="number"
                className="input text-center"
                min={2020}
                max={2100}
                value={form.startYear}
                onChange={e => setField('startYear', Number(e.target.value))}
                required
              />
              <p className="text-xs text-gray-400 text-center mt-1">Yıl</p>
            </div>
          </div>
        </div>

        <div>
          <label className="label">Dönem Sonu</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="number"
                className="input text-center"
                min={1}
                max={53}
                value={form.endWeek}
                onChange={e => setField('endWeek', Number(e.target.value))}
                required
              />
              <p className="text-xs text-gray-400 text-center mt-1">Hafta</p>
            </div>
            <span className="text-gray-400 text-sm pb-5">·</span>
            <div className="flex-1">
              <input
                type="number"
                className="input text-center"
                min={2020}
                max={2100}
                value={form.endYear}
                onChange={e => setField('endYear', Number(e.target.value))}
                required
              />
              <p className="text-xs text-gray-400 text-center mt-1">Yıl</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          Gelecek haftalardaki dersler <strong>katıldı</strong> olarak sayılır.
          En kötü senaryo kolonunda ise tüm gelecek dersler devamsız varsayılır.
        </p>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
          <button type="submit" className="btn-primary flex-1">Kaydet</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function SummaryCard({ count, label, color, icon }: { count: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <div className={`card p-3 border ${color} flex flex-col items-center text-center`}>
      {icon}
      <div className="text-2xl font-bold mt-1">{count}</div>
      <div className="text-xs font-medium mt-0.5">{label}</div>
    </div>
  )
}

function StatBox({ label, value, color = 'text-gray-900' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function ProgressBar({ percent, required, color }: { percent: number; required: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const reqPos = Math.min(100, required)
  const barColor = percent >= required ? color : percent >= required - 5 ? '#EAB308' : '#EF4444'
  return (
    <div className="relative">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, backgroundColor: barColor }} />
      </div>
      <div className="absolute top-0 w-0.5 h-2 bg-gray-400 rounded-full" style={{ left: `${reqPos}%` }} />
    </div>
  )
}

function StatusBadge({ stat }: { stat: CourseStats }) {
  const labels: Record<string, string> = { pass: 'Geçiyor', fail: 'Kalıyor', risk: 'Riskli', unknown: 'Bilinmiyor' }
  return <Badge variant={stat.status}>{labels[stat.status]}</Badge>
}
