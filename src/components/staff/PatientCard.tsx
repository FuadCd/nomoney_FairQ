'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react'
import type { PatientProfile } from '../../types'
import { shouldShowDisengagementWarning, getSuggestedAction, hasMissedCheckIn } from '../../lib/utils/burden'
import { CHECK_IN_INTERVAL_MS } from '../../lib/model/modelConstants'
import { cn } from '@/lib/utils/cn'

interface PatientCardProps {
  patient: PatientProfile
  onClick: () => void
}

const statusConfig = {
  GREEN: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/5',
    badge: 'bg-green-600 text-white',
    dot: 'bg-green-500',
    text: 'text-green-600',
  },
  AMBER: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/5',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
  },
  RED: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-500',
    text: 'text-red-600',
  },
}

const flagIcons: Record<string, string> = {
  chronicPain: '💊',
  mobility: '🦽',
  cognitive: '🧠',
  sensory: '🔊',
  language: '🌐',
  alone: '👤',
}

export default function PatientCard({ patient, onClick }: PatientCardProps) {
  const lastCheckIn = patient.checkIns[patient.checkIns.length - 1]
  const missedCheckIn = lastCheckIn
    ? hasMissedCheckIn(lastCheckIn.timestamp, CHECK_IN_INTERVAL_MS)
    : patient.checkIns.length === 0
  const showDisengagement = shouldShowDisengagementWarning(patient)
  const suggestedAction = getSuggestedAction(patient)
  const config = statusConfig[patient.alertStatus]
  
  const activeFlags = Object.entries(patient.accessibilityProfile)
    .filter(([, v]) => v)
    .map(([k]) => k)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative border-l-4 rounded-xl p-6 cursor-pointer transition-all duration-300",
        "bg-card border-border shadow-md hover:shadow-xl",
        config.border, config.bg
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {missedCheckIn && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold shadow-md"
          >
            ⚠ Missed Check-in
          </motion.span>
        )}
        <span className={cn("text-xs font-bold px-3 py-1 rounded-full shadow-md", config.badge)}>
          {patient.alertStatus}
        </span>
      </div>
      
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <motion.div
            className={cn("w-3 h-3 rounded-full", config.dot)}
            animate={showDisengagement ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="font-mono text-lg font-bold text-foreground">
            {patient.passportId}
          </span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-bold">
            CTAS {patient.ctasLevel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">{patient.assignedHospitalName}</p>
      </div>
      
      {/* Chief Complaint */}
      <div className="mb-4">
        <p className="text-base font-semibold text-foreground">{patient.chiefComplaint}</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Wait Time
          </div>
          <div className="text-xl font-bold text-foreground">{patient.minutesWaited}m</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground mb-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Burden
          </div>
          <div className={cn(
            "text-xl font-bold",
            patient.burden >= 70 ? 'text-red-600'
            : patient.burden >= 50 ? 'text-amber-600'
            : 'text-green-600'
          )}>
            {Math.round(patient.burden)}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground mb-1">Equity Gap</div>
          <div className="text-lg font-semibold text-foreground">{Math.round(patient.equityGapScore)}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground mb-1">Vulnerability</div>
          <div className="text-lg font-semibold text-foreground">
            {Math.round(patient.vulnerabilityScore * 100)}%
          </div>
        </div>
      </div>
      
      {/* Accessibility Flags */}
      {activeFlags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFlags.map((flag) => (
            <motion.span
              key={flag}
              whileHover={{ scale: 1.1 }}
              className="text-lg bg-muted px-2 py-1 rounded-lg"
              title={flag.replace(/([A-Z])/g, ' $1').trim()}
            >
              {flagIcons[flag] || '?'}
            </motion.span>
          ))}
        </div>
      )}
      
      {/* Disengagement Warning */}
      {showDisengagement && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/30 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-bold text-red-600">Disengagement Risk</span>
          </div>
          {patient.disengagementWindowMinutes && (
            <div className="text-xs text-red-600/80">
              Window: {patient.disengagementWindowMinutes} min
            </div>
          )}
        </motion.div>
      )}
      
      {/* Suggested Action */}
      {suggestedAction && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-primary text-lg">💡</span>
            <p className="text-sm text-foreground font-medium">{suggestedAction}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
