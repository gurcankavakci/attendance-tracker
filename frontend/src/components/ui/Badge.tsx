interface Props {
  variant: 'pass' | 'fail' | 'risk' | 'unknown' | 'attended' | 'absent' | 'holiday' | 'pending'
  children: React.ReactNode
}

const styles: Record<Props['variant'], string> = {
  pass:     'bg-green-100 text-green-800',
  fail:     'bg-red-100 text-red-800',
  risk:     'bg-yellow-100 text-yellow-800',
  unknown:  'bg-gray-100 text-gray-600',
  attended: 'bg-green-100 text-green-800',
  absent:   'bg-red-100 text-red-800',
  holiday:  'bg-blue-100 text-blue-800',
  pending:  'bg-gray-100 text-gray-500',
}

export default function Badge({ variant, children }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}
