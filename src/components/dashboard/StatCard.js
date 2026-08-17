"use client";

import { memo } from "react";
import { Package, Users, ShoppingCart, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS = {
  package: Package,
  users: Users,
  cart: ShoppingCart,
  rupee: IndianRupee,
};

export default function StatCard({ label, formattedValue, deltaLabel, trend, icon, sparkline, isLoading }) {
  const Icon = ICONS[icon] ?? Package;
  const isUp = trend === "up";
  const sparkData = sparkline.map((value, index) => ({ index, value }));
  const sparkColor = isUp ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)";


  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }
return (
  <Card className="group border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/10">
    <CardContent className="pt-4 sm:pt-6">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors duration-200 group-hover:bg-primary/25 sm:h-10 sm:w-10">
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {formattedValue}
            </p>

            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {label}
            </p>
          </div>
        </div>

        {/* <span
          className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[10px] font-medium sm:px-2 sm:text-xs ${
            isUp
              ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
              : "bg-red-500/15 text-red-500 dark:text-red-400"
          }`}
        >
          {isUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}

          {deltaLabel}
        </span> */}
      </div>

      <div className="mt-3 h-9 sm:h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sparkData}
            margin={{
              top: 2,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <defs>
              <linearGradient
                id={`spark-${label}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={sparkColor}
                  stopOpacity={0.35}
                />

                <stop
                  offset="100%"
                  stopColor={sparkColor}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke={sparkColor}
              strokeWidth={1.75}
              fill={`url(#spark-${label})`}
              isAnimationActive
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);
}