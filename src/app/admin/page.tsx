'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, AlertCircle, CheckCircle, Clock, Activity, Database, Shield, FileText } from 'lucide-react'
import StaffGuard from '../../components/StaffGuard'
import { usePatientStore } from '../../lib/store/patientStore'
import { computeAdminSummary } from '../../lib/utils/adminSummary'
import { MEDIAN_TOTAL_STAY_MINUTES, MEDIAN_TO_PHYSICIAN_MINUTES, MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES } from '../../lib/model/modelConstants'
import { Sidebar } from '../../components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

export default function AdminDashboardPage() {
  const patients = usePatientStore((state) => state.patients)
  const summary = computeAdminSummary(patients)
  
  const flagLabels: Record<string, { label: string; icon: string }> = {
    mobility: { label: 'Mobility Impairment', icon: '🦽' },
    chronicPain: { label: 'Chronic Pain', icon: '💊' },
    sensory: { label: 'Sensory Sensitivity', icon: '🔊' },
    cognitive: { label: 'Cognitive Overload', icon: '🧠' },
    language: { label: 'Language Barrier', icon: '🌐' },
    alone: { label: 'No Support Person', icon: '👤' },
  }
  
  const getBurdenStatus = (burden: number) => {
    if (burden >= 70) return { label: 'High strain', color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' }
    if (burden >= 30) return { label: 'Normal range', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' }
    return { label: 'Low burden', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' }
  }
  
  const burdenStatus = getBurdenStatus(summary.averageBurden)
  
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'equity', label: 'Equity Analysis', icon: <Users className="h-4 w-4" /> },
    { id: 'model', label: 'Model Health', icon: <Activity className="h-4 w-4" /> },
    { id: 'anchors', label: 'Model Anchors', icon: <Database className="h-4 w-4" /> },
  ]
  
  const StatCard = ({ title, value, subtitle, icon: Icon, trend, className }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    trend?: { value: number; label: string }
    className?: string
  }) => (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-red-600" : "text-green-600"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
  
  return (
    <StaffGuard>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeItem="overview"
          onItemClick={(id) => console.log('Navigate to:', id)}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center">
                    <BarChart3 className="h-8 w-8 mr-3 text-primary" />
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Model Health & Equity Overview (Read-Only)
                  </p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Read-Only Mode</span>
                </div>
              </div>
            </div>
          </motion.header>
          
          <div className="flex-1 px-8 py-6 overflow-auto">
            {/* Model Health Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-primary" />
                  Model Health
                </h2>
                <p className="text-sm text-muted-foreground">
                  Real-time metrics and alert distribution
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <StatCard
                  title="Total Patients"
                  value={summary.alertDistribution.total}
                  subtitle="Active in system"
                  icon={Users}
                />
                <StatCard
                  title="Average Burden"
                  value={summary.averageBurden.toFixed(1)}
                  subtitle={burdenStatus.label}
                  icon={TrendingUp}
                  className={cn(burdenStatus.bg, burdenStatus.border)}
                />
                <StatCard
                  title="Missed Check-In Rate"
                  value={`${(summary.missedCheckInRate * 100).toFixed(1)}%`}
                  subtitle="Patients with check-in > 20 min ago"
                  icon={AlertCircle}
                  className="border-amber-500/20 bg-amber-500/5"
                />
              </div>
              
              {/* Alert Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Alert Distribution</CardTitle>
                  <CardDescription>Current status breakdown across all patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-foreground">GREEN</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {summary.alertDistribution.green}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summary.alertDistribution.total > 0
                            ? Math.round((summary.alertDistribution.green / summary.alertDistribution.total) * 100)
                            : 0}% of total
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold text-foreground">AMBER</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">
                          {summary.alertDistribution.amber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summary.alertDistribution.total > 0
                            ? Math.round((summary.alertDistribution.amber / summary.alertDistribution.total) * 100)
                            : 0}% of total
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-foreground">RED</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {summary.alertDistribution.red}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {summary.alertDistribution.total > 0
                            ? Math.round((summary.alertDistribution.red / summary.alertDistribution.total) * 100)
                            : 0}% of total
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
            
            {/* Equity Overview Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-primary" />
                  Equity Overview
                </h2>
                <p className="text-sm text-muted-foreground">
                  Average burden and % RED by accessibility flag
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Flags Analysis</CardTitle>
                  <CardDescription>Impact of accessibility needs on patient burden</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(flagLabels).map(([key, { label, icon }]) => {
                      const equityData = summary.equityByFlag[key as keyof typeof summary.equityByFlag]
                      const count = patients.filter(p => p.accessibilityProfile[key as keyof typeof p.accessibilityProfile]).length
                      const percentage = summary.alertDistribution.total > 0
                        ? Math.round((count / summary.alertDistribution.total) * 100)
                        : 0
                      
                      return (
                        <motion.div
                          key={key}
                          whileHover={{ scale: 1.02 }}
                          className="bg-muted/50 rounded-lg p-4 border border-border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{icon}</span>
                              <span className="text-sm font-medium text-foreground">{label}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">{count}</div>
                              <div className="text-xs text-muted-foreground">{percentage}%</div>
                            </div>
                          </div>
                          {equityData && (
                            <div className="pt-3 border-t border-border space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Avg Burden:</span>
                                <span className="font-semibold text-foreground">{equityData.avgBurden}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">% RED:</span>
                                <span className="font-semibold text-red-600">{equityData.redPercent.toFixed(1)}%</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
            
            {/* Model Anchors Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center">
                  <Database className="h-6 w-6 mr-3 text-primary" />
                  Model Anchors
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reference values from research studies
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Research-Based Constants</CardTitle>
                  <CardDescription>Median wait times and model parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-muted/50 rounded-lg p-6 border border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="text-sm font-bold text-foreground">CIHI Study</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Stay:</span>
                          <span className="font-bold text-foreground">{MEDIAN_TOTAL_STAY_MINUTES}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To Physician:</span>
                          <span className="font-bold text-foreground">{MEDIAN_TO_PHYSICIAN_MINUTES}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-6 border border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="text-sm font-bold text-foreground">McMaster Study</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time to Physician:</span>
                          <span className="font-bold text-foreground">{MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-6 border border-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div className="text-sm font-bold text-foreground">Data Sources</div>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div>• Health Quality Council of Alberta (HQCA)</div>
                        <div>• Statistics Canada – Disability in Canada (2024)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-sm text-foreground font-semibold flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-amber-600" />
                        <strong>Safety:</strong> Admin cannot change thresholds, weights, patients, LWBS scaling, or triage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </div>
    </StaffGuard>
  )
}
