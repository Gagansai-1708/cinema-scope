"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayPickerProps, NavProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Custom Navbar for react-day-picker v8+
  const Navbar = ({ onPreviousClick, onNextClick }: NavProps) => {
    return (
      <div className="flex justify-between mb-2">
        <button
          onClick={onPreviousClick}
          className={buttonVariants({ variant: "outline" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNextClick}
          className={buttonVariants({ variant: "outline" })}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex justify-between mb-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal"),
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
  // @ts-ignore
  navbar: Navbar,
}}

      {...props}
    />
  )
}

Calendar.displayName = "Calendar"
