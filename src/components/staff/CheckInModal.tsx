'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2, AlertCircle } from 'lucide-react'
import type { PatientProfile } from '../../types'
import { api } from '../../lib/api/api'
import { usePatientStore } from '../../lib/store/patientStore'
import { cn } from '@/lib/utils/cn'

interface CheckInModalProps {
  patient: PatientProfile
  onClose: () => void
}

export default function CheckInModal({ patient, onClose }: CheckInModalProps) {
  const updatePatient = usePatientStore((state) => state.updatePatient)
  const [discomfortLevel, setDiscomfortLevel] = useState(3)
  const [intendsToStay, setIntendsToStay] = useState(true)
  const [assistanceRequested, setAssistanceRequested] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const assistanceOptions = [
    { value: 'interpreter', label: 'Interpreter', icon: '🌐' },
    { value: 'mobility', label: 'Mobility Assistance', icon: '🦽' },
    { value: 'quiet-space', label: 'Quiet Space', icon: '🔇' },
    { value: 'info', label: 'Wait Time Info', icon: 'ℹ️' },
  ]
  
  const handleAssistanceToggle = (value: string) => {
    setAssistanceRequested((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }
  
  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.submitCheckIn({
        passportId: patient.passportId,
        discomfortLevel,
        assistanceRequested: assistanceRequested.length > 0 ? assistanceRequested : undefined,
        intendsToStay,
        timestamp: new Date().toISOString(),
      })
      
      const burdenResponse = await api.computeBurden({
        facilityId: patient.assignedHospitalKey,
        profile: patient.accessibilityProfile,
        estimatedCtasLevel: patient.ctasLevel,
        waitTimeMinutes: patient.minutesWaited,
        checkInResponses: [
          ...patient.checkIns,
          {
            discomfortLevel,
            assistanceRequested: assistanceRequested.length > 0 ? assistanceRequested : undefined,
            intendsToStay,
            timestamp: new Date().toISOString(),
          },
        ],
      })
      
      updatePatient(patient.id, {
        checkIns: [
          ...patient.checkIns,
          {
            discomfortLevel,
            assistanceRequested,
            intendsToStay,
            timestamp: new Date().toISOString(),
          },
        ],
        burden: burdenResponse.burden,
        alertStatus: burdenResponse.alertStatus,
        suggestAmberCheckIn: burdenResponse.suggestAmberCheckIn,
        disengagementWindowMinutes: burdenResponse.disengagementWindowMinutes,
        burdenCurve: burdenResponse.burdenCurve,
        baselineCurve: burdenResponse.baselineCurve,
        equityGapScore: burdenResponse.equityGapScore,
      })
      
      onClose()
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Failed to submit check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary-foreground mb-1">
                  20-Minute Check-In
                </h2>
                <p className="text-primary-foreground/80 text-sm">
                  Patient: <span className="font-mono font-semibold">{patient.passportId}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Discomfort Level */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Discomfort Level (1-5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    type="button"
                    onClick={() => setDiscomfortLevel(level)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "py-4 px-3 rounded-lg font-bold text-lg transition-all",
                      discomfortLevel === level
                        ? level <= 2
                          ? 'bg-green-600 text-white shadow-lg'
                          : level === 3
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-red-600 text-white shadow-lg'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {discomfortLevel <= 2 ? 'Low' : discomfortLevel === 3 ? 'Moderate' : 'High'} discomfort
              </p>
            </div>
            
            {/* Intends to Stay */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Planning to Stay?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setIntendsToStay(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "py-4 px-4 rounded-lg font-semibold transition-all flex items-center justify-center",
                    intendsToStay
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Yes, staying
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIntendsToStay(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "py-4 px-4 rounded-lg font-semibold transition-all flex items-center justify-center",
                    !intendsToStay
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Thinking of leaving
                </motion.button>
              </div>
            </div>
            
            {/* Assistance Requested */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Assistance Requested (optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {assistanceOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleAssistanceToggle(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2",
                      assistanceRequested.includes(option.value)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-muted/50 px-6 py-4 rounded-b-2xl border-t border-border flex space-x-3">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-muted text-muted-foreground py-3 px-4 rounded-lg font-semibold hover:bg-accent transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={cn(
                "flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold",
                "hover:bg-primary/90 transition-all shadow-lg shadow-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Check-In
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
