'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, AlertCircle, Clock, X, TrendingUp, Activity, AlertTriangle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react'
import StaffGuard from '../../components/StaffGuard'
import { usePatientStore } from '../../lib/store/patientStore'
import { api } from '../../lib/api/api'
import PatientCard from '../../components/staff/PatientCard'
import BurdenChart from '../../components/staff/BurdenChart'
import CheckInModal from '../../components/staff/CheckInModal'
import { Sidebar } from '../../components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import type { PatientProfile } from '../../types'
import { cn } from '@/lib/utils/cn'

export default function StaffDashboardPage() {
  const { patients, updatePatient } = usePatientStore()
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [waitTimes, setWaitTimes] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [snapshotTime, setSnapshotTime] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  
  // Fetch wait times
  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        const data = await api.getWaitTimes()
        const times: Record<string, number> = {}
        Object.entries(data.hospitals).forEach(([key, hospital]: [string, any]) => {
          times[key] = hospital.waitMinutes
        })
        setWaitTimes(times)
        setSnapshotTime(data.snapshotTakenAt || '')
      } catch (error) {
        console.error('Error fetching wait times:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWaitTimes()
    const interval = setInterval(fetchWaitTimes, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Update patient wait times and recompute burden
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const patient of patients) {
        const minutesWaited = Math.floor(
          (Date.now() - new Date(patient.arrivedAt).getTime()) / 60000
        )
        
        if (minutesWaited !== patient.minutesWaited) {
          try {
            const burdenResponse = await api.computeBurden({
              facilityId: patient.assignedHospitalKey,
              profile: patient.accessibilityProfile,
              estimatedCtasLevel: patient.ctasLevel,
              waitTimeMinutes: minutesWaited,
              checkInResponses: patient.checkIns.map(ci => ({
                discomfortLevel: ci.discomfortLevel,
                assistanceRequested: ci.assistanceRequested,
                intendsToStay: ci.intendsToStay,
                timestamp: ci.timestamp,
              })),
            })
            
            updatePatient(patient.id, {
              minutesWaited,
              burden: burdenResponse.burden,
              alertStatus: burdenResponse.alertStatus,
              suggestAmberCheckIn: burdenResponse.suggestAmberCheckIn,
              disengagementWindowMinutes: burdenResponse.disengagementWindowMinutes,
              equityGapScore: burdenResponse.equityGapScore,
              burdenCurve: burdenResponse.burdenCurve,
              baselineCurve: burdenResponse.baselineCurve,
            })
          } catch (error) {
            console.error(`Error updating patient ${patient.id}:`, error)
          }
        }
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [patients, updatePatient])
  
  // Sort patients by priority (RED > AMBER > GREEN, then by burden)
  const sortedPatients = [...patients].sort((a, b) => {
    const statusOrder = { RED: 0, AMBER: 1, GREEN: 2 }
    if (statusOrder[a.alertStatus] !== statusOrder[b.alertStatus]) {
      return statusOrder[a.alertStatus] - statusOrder[b.alertStatus]
    }
    return b.burden - a.burden
  })
  
  const redCount = patients.filter((p) => p.alertStatus === 'RED').length
  const amberCount = patients.filter((p) => p.alertStatus === 'AMBER').length
  const greenCount = patients.filter((p) => p.alertStatus === 'GREEN').length
  const avgBurden = patients.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + p.burden, 0) / patients.length)
    : 0
  
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'patients', label: 'Patients', icon: <Users className="h-4 w-4" />, badge: patients.length },
    { id: 'alerts', label: 'Alerts', icon: <AlertCircle className="h-4 w-4" />, badge: redCount + amberCount },
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
          activeItem="patients"
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
                  <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time patient monitoring and burden tracking
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
                  >
                    {viewMode === 'cards' ? 'Table View' : 'Card View'}
                  </motion.button>
                  {snapshotTime && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Updated {new Date(snapshotTime).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.header>
          
          {/* Stats Grid */}
          <div className="px-8 py-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
              >
                <StatCard
                  title="Total Patients"
                  value={patients.length}
                  subtitle="Active in queue"
                  icon={Users}
                />
                <StatCard
                  title="Critical Alerts"
                  value={redCount}
                  subtitle="Requires immediate attention"
                  icon={AlertTriangle}
                  className="border-red-500/20 bg-red-500/5"
                />
                <StatCard
                  title="Warning Alerts"
                  value={amberCount}
                  subtitle="Monitor closely"
                  icon={AlertCircle}
                  className="border-amber-500/20 bg-amber-500/5"
                />
                <StatCard
                  title="Average Burden"
                  value={avgBurden}
                  subtitle="Across all patients"
                  icon={TrendingUp}
                />
              </motion.div>
            )}
          </div>
          
          {/* Patients Section */}
          <div className="flex-1 px-8 pb-8">
            {patients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-2xl font-semibold text-foreground mb-2">No patients in queue</p>
                <p className="text-muted-foreground">
                  Patients will appear here after completing intake
                </p>
              </motion.div>
            ) : viewMode === 'table' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Patient Queue</CardTitle>
                  <CardDescription>All patients sorted by priority</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Burden</TableHead>
                        <TableHead>CTAS</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPatients.map((patient) => {
                        const statusConfig = {
                          RED: { color: 'text-red-600', bg: 'bg-red-500/10', label: 'RED' },
                          AMBER: { color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'AMBER' },
                          GREEN: { color: 'text-green-600', bg: 'bg-green-500/10', label: 'GREEN' },
                        }[patient.alertStatus]
                        
                        return (
                          <TableRow
                            key={patient.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <TableCell>
                              <span className={cn("px-2 py-1 rounded-full text-xs font-bold", statusConfig.bg, statusConfig.color)}>
                                {statusConfig.label}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono font-medium">{patient.passportId}</TableCell>
                            <TableCell>{patient.assignedHospitalName}</TableCell>
                            <TableCell>{patient.minutesWaited}m</TableCell>
                            <TableCell>
                              <span className={cn(
                                "font-bold",
                                patient.burden >= 70 ? 'text-red-600'
                                : patient.burden >= 50 ? 'text-amber-600'
                                : 'text-green-600'
                              )}>
                                {Math.round(patient.burden)}
                              </span>
                            </TableCell>
                            <TableCell>CTAS {patient.ctasLevel}</TableCell>
                            <TableCell>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedPatient(patient)
                                  setShowCheckInModal(true)
                                }}
                                className="text-primary hover:underline text-sm font-medium"
                              >
                                Check-In
                              </motion.button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Cards */}
                <div className="lg:col-span-2 space-y-4">
                  {sortedPatients.map((patient, idx) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <PatientCard
                        patient={patient}
                        onClick={() => setSelectedPatient(patient)}
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* Sidebar - Selected Patient Details */}
                <AnimatePresence>
                  {selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="lg:col-span-1"
                    >
                      <Card className="sticky top-[200px]">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Patient Details</CardTitle>
                            <motion.button
                              onClick={() => setSelectedPatient(null)}
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <div className="text-sm text-muted-foreground mb-1">Passport ID</div>
                            <div className="font-mono font-bold text-lg text-foreground">{selectedPatient.passportId}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Chief Complaint</div>
                            <div className="font-semibold text-foreground">{selectedPatient.chiefComplaint}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="text-xs text-muted-foreground mb-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Wait Time
                              </div>
                              <div className="text-xl font-bold text-foreground">{selectedPatient.minutesWaited}m</div>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="text-xs text-muted-foreground mb-1">CTAS</div>
                              <div className="text-xl font-bold text-foreground">{selectedPatient.ctasLevel}</div>
                            </div>
                          </div>
                          
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <div className="text-sm text-muted-foreground mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Current Burden
                            </div>
                            <div className={cn(
                              "text-4xl font-black",
                              selectedPatient.burden >= 70 ? 'text-red-600'
                              : selectedPatient.burden >= 50 ? 'text-amber-600'
                              : 'text-green-600'
                            )}>
                              {Math.round(selectedPatient.burden)}
                            </div>
                          </div>
                          
                          {selectedPatient.burdenCurve && selectedPatient.baselineCurve && (
                            <BurdenChart
                              burdenCurve={selectedPatient.burdenCurve}
                              baselineCurve={selectedPatient.baselineCurve}
                              currentMinute={selectedPatient.minutesWaited}
                              burden={selectedPatient.burden}
                            />
                          )}
                          
                          <motion.button
                            onClick={() => {
                              setShowCheckInModal(true)
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                            Record Check-In
                          </motion.button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Check-In Modal */}
      {showCheckInModal && selectedPatient && (
        <CheckInModal
          patient={selectedPatient}
          onClose={() => {
            setShowCheckInModal(false)
            setSelectedPatient(null)
          }}
        />
      )}
    </StaffGuard>
  )
}
