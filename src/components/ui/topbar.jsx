import * as React from "react"
import { cn } from "../../lib/utils.js"

const Topbar = React.forwardRef(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex items-center justify-between w-full bg-white border-b border-border px-4 py-2", className)}
    {...props}
  />
))
Topbar.displayName = "Topbar"

const TopbarLeft = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  />
))
TopbarLeft.displayName = "TopbarLeft"

const TopbarMiddle = React.forwardRef(({ className, align = "center", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      align === "left" && "justify-start",
      align === "center" && "justify-center", 
      align === "right" && "justify-end",
      className
    )}
    {...props}
  />
))
TopbarMiddle.displayName = "TopbarMiddle"

const TopbarRight = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  />
))
TopbarRight.displayName = "TopbarRight"

const TopbarItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
))
TopbarItem.displayName = "TopbarItem"

Topbar.Left = TopbarLeft
Topbar.Middle = TopbarMiddle
Topbar.Right = TopbarRight
Topbar.Item = TopbarItem

export { Topbar, TopbarLeft, TopbarMiddle, TopbarRight, TopbarItem }