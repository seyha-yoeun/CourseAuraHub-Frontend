// Class strings shared by the admin and instructor pages, matching the existing forms and tables.
// Colours follow the system in assets/css/main.css: brand-* accent, slate-* = ink neutrals.

export const inputClass = 'w-full rounded-[10px] border border-white/10 bg-white/4 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition-all duration-200 placeholder:text-white/30 focus:border-brand-500/50 focus:bg-white/7 focus:ring-2 focus:ring-brand-500/15 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:border-brand-600'
export const labelClass = 'mb-1.5 block text-xs font-semibold text-white/60 light:text-slate-600'
export const cardClass = 'rounded-[18px] border border-white/10 bg-white/5 p-4 sm:p-5 light:border-slate-200 light:bg-white'
export const emptyBox = 'rounded-[18px] border border-white/10 bg-white/5 px-5 py-12 text-center text-[13px] text-white/45 light:border-slate-200 light:bg-white light:text-slate-500'
export const tableWrap = 'overflow-x-auto rounded-[18px] border border-white/10 bg-white/5 light:border-slate-200 light:bg-white'
export const headRow = 'border-b border-white/8 text-[12px] font-medium text-white/45 light:border-slate-200 light:text-slate-500'

const actionBase = 'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
export const primaryAction = `${actionBase} border-brand-500/35 bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 light:border-brand-200 light:bg-brand-50 light:text-brand-700`
export const neutralAction = `${actionBase} border-white/10 bg-white/5 text-white/75 hover:bg-white/9 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700`
export const dangerAction = `${actionBase} border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 light:border-rose-200 light:bg-rose-50 light:text-rose-600`
export const primaryButton = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-transparent bg-brand-500 px-4 py-2.25 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-500'
export const pagerButton = 'cursor-pointer rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40 light:border-slate-200 light:bg-slate-100 light:text-slate-700'
export const pageTitle = 'text-2xl font-bold tracking-[-0.02em] text-slate-50 sm:text-[26px] light:text-slate-900'
export const pageSubtitle = 'mt-1 text-[13px] text-white/45 light:text-slate-500'
export const sectionTitle = 'text-base font-bold text-slate-100 light:text-slate-900'
