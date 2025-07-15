import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-200 ease-in-out shadow-md disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:border-primary border border-slate-200 bg-primary text-white hover:bg-amber-500 hover:scale-105 active:scale-95 active:bg-teal-800 shadow-[0_4px_24px_rgba(15,118,110,0.08)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-amber-500 hover:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200",
        outline:
          "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost:
          "bg-transparent text-primary hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 py-1.5 text-sm",
        lg: "h-14 px-8 py-3 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    (<Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />)
  );
}

export { Button, buttonVariants }
