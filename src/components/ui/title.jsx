import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils.js"

const titleVariants = cva(
  "scroll-m-20 tracking-tight",
  {
    variants: {
      variant: {
        h1: "text-4xl font-extrabold lg:text-5xl",
        h2: "text-3xl font-semibold",
        h3: "text-2xl font-semibold",
        h4: "text-xl font-semibold",
        h5: "text-lg font-semibold",
        h6: "text-base font-semibold",
      },
    },
    defaultVariants: {
      variant: "h2",
    },
  }
)

const Title = React.forwardRef(({ className, variant, as, ...props }, ref) => {
  const Comp = as || "h2"
  return (
    <Comp
      className={cn(titleVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
Title.displayName = "Title"

export { Title, titleVariants }