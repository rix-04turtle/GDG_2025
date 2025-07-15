import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    (<textarea
      data-slot="textarea"
      className={cn(
        "border border-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30 bg-white flex min-h-24 w-full rounded-xl px-4 py-3 text-base shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        className
      )}
      {...props} />)
  );
}

export { Textarea }
