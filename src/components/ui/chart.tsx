"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
  Legend as RechartsLegend,
  LegendProps,
} from "recharts"

import { cn } from "@/lib/utils"

// Themes for dynamic chart colors
const THEMES = { light: "", dark: ".dark" } as const

// Chart configuration type
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// Context for chart config
type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within <ChartContainer />")
  return context
}

// Chart container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactElement // ✅ Changed from React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"


// ChartStyle for dynamic colors
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color || cfg.theme)
  if (!colorConfig.length) return null

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme?.[theme as keyof typeof cfg.theme] || cfg.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`)
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// Tooltip wrapper
const ChartTooltip = RechartsTooltip

// Tooltip content
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipProps<number, string> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    labelKey?: string
  }
>((props, ref) => {
  const {
    active,
    payload = [],
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    labelKey,
  } = props

  const { config } = useChart()

  // Hooks must be called unconditionally and before any early returns
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel) return null
    if (!payload || payload.length === 0) return null
    const item = payload[0]
    const key = labelKey || item.dataKey || item.name || "value"
    const itemConfig = config[key as keyof typeof config]
    const value = !labelKey && typeof label === "string" ? itemConfig?.label || label : itemConfig?.label

    if (labelFormatter && value)
      return <div className={cn("font-medium", labelClassName ?? undefined)}>{labelFormatter(value, payload)}</div>
    if (!value) return null
    return <div className={cn("font-medium", labelClassName ?? undefined)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className ?? undefined
      )}
    >
      {tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = labelKey || item.name || item.dataKey || "value"
          const itemConfig = config[key as keyof typeof config]
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey ?? index}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item.value !== undefined && item.name
                ? formatter(item.value, item.name, item, index, item.payload)
                : (
                  <>
                    {itemConfig?.icon && !hideIndicator ? <itemConfig.icon /> : null}
                    <div className="flex flex-1 justify-between leading-none">
                      <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                      {item.value !== undefined && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Legend
const ChartLegend = RechartsLegend
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  LegendProps & { hideIcon?: boolean; nameKey?: string }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()
  if (!payload || payload.length === 0) return null

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item, index) => {
        const key = nameKey || item.dataKey || `value-${index}`
        const itemConfig = config[key as keyof typeof config]

        return (
          <div key={item.dataKey ?? index} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground">
            {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
