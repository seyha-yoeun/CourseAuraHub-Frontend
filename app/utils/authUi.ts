/**
 * Class tokens for the auth screens (layouts/auth.vue, pages/auth/*).
 * The auth world uses a deep-green / emerald accent instead of the app's violet,
 * dark-first with `light:` overrides like the rest of the codebase.
 */

export const authTitle = 'text-[26px] font-bold leading-tight tracking-[-0.02em] text-slate-50 sm:text-[30px] short:text-[24px] sm:short:text-[26px] light:text-slate-900'

export const authSubtitle = 'mt-2 text-[14.5px] leading-relaxed text-white/55 short:mt-1 short:text-[14px] light:text-slate-500'

export const authLabel = 'text-[13px] font-semibold text-slate-200 light:text-slate-800'

const inputBase = 'h-11 short:h-10 w-full rounded-[10px] border bg-white/[0.035] px-3.5 text-[14.5px] text-slate-100 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-white/30 focus:bg-white/[0.06] focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60 light:bg-white light:text-slate-900 light:placeholder:text-slate-400 light:focus:bg-white'

export const authInput = `${inputBase} border-white/12 hover:border-white/20 focus:border-emerald-400/70 focus:ring-emerald-400/15 light:border-slate-300 light:hover:border-slate-400 light:focus:border-emerald-600 light:focus:ring-emerald-600/15`

export const authInputError = `${inputBase} border-rose-400/70 ring-[3px] ring-rose-500/12 focus:border-rose-400 focus:ring-rose-500/15 light:border-rose-400 light:focus:border-rose-500`

export const authFieldError = 'flex items-start gap-1.5 text-[12.5px] leading-snug text-rose-400 light:text-rose-600'

export const authHint = 'text-[12.5px] leading-snug text-white/45 light:text-slate-500'

// 48px, single line, no glow. Hover goes a shade darker; dark mode keeps >= 4.5:1 text contrast on hover.
export const authPrimaryButton = 'inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-emerald-500 px-5 text-[15px] font-semibold whitespace-nowrap text-emerald-950 transition-[background-color,transform] duration-150 hover:bg-[#0ea371] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-400/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 aria-disabled:cursor-wait aria-disabled:active:scale-100 light:bg-[#0f2f24] light:text-white light:hover:bg-[#0a231a] light:focus-visible:ring-emerald-600/30'

export const authSecondaryButton = 'inline-flex h-11 short:h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/12 bg-white/[0.035] px-4 text-[14px] font-semibold text-slate-100 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-55 light:border-slate-300 light:bg-white light:text-slate-800 light:hover:border-slate-400 light:hover:bg-slate-50 light:focus-visible:ring-emerald-600/25'

/** Inline text link in the emerald accent. */
export const authLink = 'rounded-sm font-semibold text-emerald-400 underline-offset-[3px] transition-colors hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 light:text-emerald-700 light:hover:text-emerald-800'

/** Quieter link for the "New here? Create an account" style footers. */
export const authStrongLink = 'rounded-sm font-semibold text-slate-100 underline decoration-white/30 underline-offset-[3px] transition-colors hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 light:text-slate-900 light:decoration-slate-300 light:hover:decoration-emerald-600'

/** "← Back to log in" link above the heading on secondary screens. */
export const authBackLink = 'mb-8 short:mb-5 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-white/55 transition-colors hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 light:text-slate-500 light:hover:text-slate-900'

export const authFooterText = 'text-center text-[14px] text-white/55 light:text-slate-500'

export const authCheckbox = 'size-4 shrink-0 cursor-pointer accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:cursor-not-allowed light:accent-emerald-700'

const alertBase = 'flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13px] leading-relaxed'

export const authAlertError = `${alertBase} border-rose-500/30 bg-rose-500/10 text-rose-200 light:border-rose-200 light:bg-rose-50 light:text-rose-800`

export const authAlertWarning = `${alertBase} border-amber-400/30 bg-amber-400/10 text-amber-100 light:border-amber-200 light:bg-amber-50 light:text-amber-900`

export const authAlertSuccess = `${alertBase} border-emerald-400/30 bg-emerald-400/10 text-emerald-100 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-900`

/** Round icon badge shown above the heading on single-purpose screens. */
export const authIconBadge = 'mb-5 short:mb-4 flex size-12 short:size-11 items-center justify-center rounded-[14px] border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700'

export const authIconBadgeDanger = 'mb-5 short:mb-4 flex size-12 short:size-11 items-center justify-center rounded-[14px] border border-rose-400/25 bg-rose-400/10 text-rose-300 light:border-rose-200 light:bg-rose-50 light:text-rose-600'

/** Vertical rhythm. On short viewports (<= 820px tall) everything tightens so forms stay above the fold. */
export const authForm = 'flex flex-col gap-4.5 short:gap-3'

export const authField = 'flex flex-col gap-1.5 short:gap-1'

/** Space between the heading block and the first control. */
export const authBodyGap = 'mt-7 short:mt-5'
