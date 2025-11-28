import * as React from "react"
import { cn } from "@/lib/utils"

const Container = React.forwardRef(({
  className,
  containerType = "div",
  direction = "row",
  align = "start",
  justify = "start",
  gap = "none",
  ...props
}, ref) => {
  const gapClasses = {
    none: "",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  };

  const containerClasses = containerType === "flex"
    ? `flex flex-${direction} items-${align} justify-${justify} ${gapClasses[gap]}`
    : "container mx-auto px-4";

  return (
    <div
      ref={ref}
      className={cn(containerClasses, className)}
      {...props}
    />
  );
})
Container.displayName = "Container"

const ContainerItem = React.forwardRef(({
  className,
  order = "none",
  alignSelf = "auto",
  ...props
}, ref) => {
  const orderClasses = {
    none: "",
    first: "order-first",
    last: "order-last",
    1: "order-1",
    2: "order-2",
    3: "order-3"
  };

  const alignSelfClasses = {
    auto: "",
    start: "self-start",
    end: "self-end",
    center: "self-center",
    stretch: "self-stretch"
  };

  return (
    <div
      ref={ref}
      className={cn(orderClasses[order], alignSelfClasses[alignSelf], className)}
      {...props}
    />
  );
})
ContainerItem.displayName = "ContainerItem"

Container.Item = ContainerItem

export { Container }