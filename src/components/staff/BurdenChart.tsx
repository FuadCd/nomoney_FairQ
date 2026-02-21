'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { BurdenCurvePoint } from '../../types'
import { cn } from '@/lib/utils/cn'

interface BurdenChartProps {
  burdenCurve: BurdenCurvePoint[]
  baselineCurve: Array<{ timeMinutes: number; distressProbability: number; lwbsProbability: number }>
  currentMinute: number
  burden: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border-2 border-border rounded-lg p-4 shadow-xl">
        <p className="font-bold text-foreground mb-2">{label} minutes</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span>{' '}
            <span className="font-bold">{Math.round(entry.value)}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function BurdenChart({
  burdenCurve,
  baselineCurve,
  currentMinute,
  burden,
}: BurdenChartProps) {
  const chartData = burdenCurve.map((point, i) => ({
    minute: point.timeMinutes,
    baseline: Math.round((baselineCurve[i]?.distressProbability || 0) * 100),
    actual: Math.round(point.distressProbability * 100),
    lwbs: Math.round(point.lwbsProbability * 100),
  }))
  
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-1">Burden Curve</h3>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-xs text-muted-foreground">Current Burden</span>
            <span className={cn(
              "ml-2 text-2xl font-black",
              burden >= 70 ? 'text-red-600'
              : burden >= 50 ? 'text-amber-600'
              : 'text-green-600'
            )}>
              {Math.round(burden)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">•</div>
          <div>
            <span className="text-xs text-muted-foreground">Wait Time</span>
            <span className="ml-2 font-bold text-foreground">{currentMinute}m</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          
          <XAxis
            dataKey="minute"
            label={{ value: 'Minutes Waited', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          />
          <YAxis
            label={{ value: 'Burden Index', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="line"
          />
          
          <ReferenceLine 
            y={75} 
            stroke="#dc2626" 
            strokeDasharray="4 3" 
            strokeWidth={2}
            label={{ value: 'RED Threshold', position: 'right', style: { fill: '#dc2626', fontSize: '10px', fontWeight: 'bold' } }}
          />
          <ReferenceLine 
            y={50} 
            stroke="#d97706" 
            strokeDasharray="4 3" 
            strokeWidth={2}
            label={{ value: 'AMBER Threshold', position: 'right', style: { fill: '#d97706', fontSize: '10px', fontWeight: 'bold' } }}
          />
          <ReferenceLine 
            x={currentMinute} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="5 4" 
            strokeWidth={2}
            label={{ value: 'Now', position: 'top', style: { fill: 'hsl(var(--muted-foreground))', fontSize: '10px', fontWeight: 'bold' } }}
          />
          
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={false}
            name="Baseline (no barriers)"
            strokeOpacity={0.8}
          />
          
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={false}
            name="Actual (with barriers)"
            strokeOpacity={0.9}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
