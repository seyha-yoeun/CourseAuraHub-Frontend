import {
  AlertTriangle,
  Award,
  BarChart3,
  BellRing,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Megaphone,
  MessageSquareText,
  PlayCircle,
  Receipt,
  Repeat,
  ShieldCheck,
  Users,
  Video,
  Wallet,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { AppNotification } from '~/types'

export interface NotificationStyle {
  icon: Component
  iconClass: string
  bgClass: string
}

/**
 * Icon and semantic colour per notification type, shared by the header bell panel and the
 * notifications inbox. Typed as a full Record so a new backend type fails the type check here.
 * Colours: emerald success, amber attention, rose failure, blue info, brand course activity.
 */
export const notificationStyles: Record<AppNotification['type'], NotificationStyle> = {
  enrolled: { icon: GraduationCap, iconClass: 'text-emerald-400 light:text-emerald-700', bgClass: 'bg-emerald-400/15 light:bg-emerald-50' },
  subscription: { icon: Repeat, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  payment_failed: { icon: AlertTriangle, iconClass: 'text-rose-400 light:text-rose-700', bgClass: 'bg-rose-400/15 light:bg-rose-50' },
  order_refunded: { icon: Receipt, iconClass: 'text-blue-400 light:text-blue-700', bgClass: 'bg-blue-400/15 light:bg-blue-50' },
  refund_request: { icon: Receipt, iconClass: 'text-amber-400 light:text-amber-700', bgClass: 'bg-amber-400/15 light:bg-amber-50' },
  certificate_issued: { icon: Award, iconClass: 'text-amber-400 light:text-amber-700', bgClass: 'bg-amber-400/15 light:bg-amber-50' },
  new_lesson: { icon: PlayCircle, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  live_session: { icon: Video, iconClass: 'text-rose-400 light:text-rose-700', bgClass: 'bg-rose-400/15 light:bg-rose-50' },
  course_updated: { icon: BookOpen, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  new_enrollment: { icon: Users, iconClass: 'text-emerald-400 light:text-emerald-700', bgClass: 'bg-emerald-400/15 light:bg-emerald-50' },
  course_completed: { icon: Award, iconClass: 'text-emerald-400 light:text-emerald-700', bgClass: 'bg-emerald-400/15 light:bg-emerald-50' },
  member_card: { icon: CreditCard, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  payout: { icon: Wallet, iconClass: 'text-emerald-400 light:text-emerald-700', bgClass: 'bg-emerald-400/15 light:bg-emerald-50' },
  lesson_question: { icon: HelpCircle, iconClass: 'text-blue-400 light:text-blue-700', bgClass: 'bg-blue-400/15 light:bg-blue-50' },
  assignment: { icon: ClipboardCheck, iconClass: 'text-emerald-400 light:text-emerald-700', bgClass: 'bg-emerald-400/15 light:bg-emerald-50' },
  course_review: { icon: ShieldCheck, iconClass: 'text-amber-400 light:text-amber-700', bgClass: 'bg-amber-400/15 light:bg-amber-50' },
  course_survey: { icon: MessageSquareText, iconClass: 'text-blue-400 light:text-blue-700', bgClass: 'bg-blue-400/15 light:bg-blue-50' },
  course_reminder: { icon: BellRing, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  announcement: { icon: Megaphone, iconClass: 'text-brand-300 light:text-brand-600', bgClass: 'bg-brand-400/15 light:bg-brand-50' },
  weekly_report: { icon: BarChart3, iconClass: 'text-blue-400 light:text-blue-700', bgClass: 'bg-blue-400/15 light:bg-blue-50' },
}
