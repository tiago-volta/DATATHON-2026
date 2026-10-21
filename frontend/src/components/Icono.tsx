import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Circle,
  ClipboardList,
  Eye,
  FilePen,
  Handshake,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Scale,
  ScrollText,
  Search,
  Square,
  Star,
  Stethoscope,
  User,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const POR_SIMBOLO: Record<string, LucideIcon> = {
  '📬': Mail,
  '📝': FilePen,
  '🏛️': Landmark,
  '🗣️': MessageCircle,
  '✅': Check,
  '👔': User,
  '🔍': Search,
  '⚖️': Scale,
  '📜': ScrollText,
  '📋': ClipboardList,
  '🤝': Handshake,
  '🩺': Stethoscope,
  '👁️': Eye,
  '📅': Calendar,
  '📍': MapPin,
  '👤': User,
  '⚡': Zap,
  '🦯': Accessibility,
  '🎤': Mic,
  '⏹': Square,
  '✓': Check,
  '✕': X,
  '⚠': AlertTriangle,
  '✗': X,
  '★': Star,
  '○': Circle,
  '·': Circle,
  '←': ArrowLeft,
  '→': ArrowRight,
}

interface Props {
  nombre: string
  className?: string
}

export function Icono({ nombre, className = 'h-5 w-5' }: Props) {
  const Dibujo = POR_SIMBOLO[nombre] ?? Circle

  return (
    <Dibujo
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      strokeWidth={2}
    />
  )
}
