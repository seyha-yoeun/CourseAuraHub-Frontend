export default defineAppConfig({
  ui: {
    // Nuxt UI components (toasts, breadcrumbs) follow the app's colour system (assets/css/main.css).
    colors: {
      primary: 'brand',
      neutral: 'slate',
    },

    // Toasts: a calm card that matches the app's surfaces. Colour is carried by the icon only;
    // title and text stay neutral so every toast reads the same way. Dark-first with `light:`.
    toast: {
      slots: {
        root: 'relative group flex gap-3 overflow-hidden rounded-xl border border-white/10 ring-0 bg-[#141d19] p-3.5 pr-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] light:border-slate-200 light:bg-white light:shadow-[0_12px_32px_-12px_rgba(11,31,23,0.22)]',
        wrapper: 'w-0 flex-1 flex flex-col',
        title: 'text-[13.5px] leading-snug font-semibold text-slate-50 light:text-slate-900',
        description: 'text-[13px] leading-snug text-white/60 light:text-slate-500',
        icon: 'mt-px shrink-0 size-[18px]',
        actions: 'flex gap-1.5 shrink-0',
        close: 'p-1 -m-0.5 rounded-md text-white/40 hover:bg-white/8 hover:text-white light:text-slate-400 light:hover:bg-slate-100 light:hover:text-slate-700',
      },
      variants: {
        color: {
          primary: { root: 'focus-visible:outline-2 focus-visible:outline-brand-400/50', icon: 'text-brand-300 light:text-brand-600' },
          success: { root: 'focus-visible:outline-2 focus-visible:outline-brand-400/50', icon: 'text-brand-300 light:text-brand-600' },
          info: { root: 'focus-visible:outline-2 focus-visible:outline-sky-400/50', icon: 'text-sky-300 light:text-sky-600' },
          warning: { root: 'focus-visible:outline-2 focus-visible:outline-amber-400/50', icon: 'text-amber-300 light:text-warning' },
          error: { root: 'focus-visible:outline-2 focus-visible:outline-rose-400/50', icon: 'text-rose-300 light:text-negative' },
          neutral: { root: 'focus-visible:outline-2 focus-visible:outline-white/40', icon: 'text-white/70 light:text-slate-600' },
        },
        orientation: {
          horizontal: { root: 'items-start', actions: 'items-center' },
          vertical: { root: 'items-start', actions: 'items-start mt-2.5' },
        },
        title: {
          true: { description: 'mt-0.5' },
        },
      },
    },

    toaster: {
      slots: {
        viewport: 'fixed flex flex-col w-[calc(100%-2rem)] sm:w-[22rem] z-[100] data-[expanded=true]:h-(--height) focus:outline-none',
      },
    },
  },
})
