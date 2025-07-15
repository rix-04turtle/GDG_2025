import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    (<input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-slate-800 placeholder:text-slate-500 selection:bg-primary selection:text-white bg-white border border-slate-200 flex h-12 w-full min-w-0 rounded-xl px-4 py-2 text-base shadow-sm transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 md:text-base",
        className
      )}
      {...props} />)
  );
}

export { Input }
