'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Loader2, ArrowLeft } from 'lucide-react'
import { api } from '../../../lib/api/api'
import { usePatientStore } from '../../../lib/store/patientStore'
import { cn } from '@/lib/utils/cn'

export default function PatientCheckInPage() {
  const router = useRouter()
  const patients = usePatientStore((state) => state.patients)
  const updatePatient = usePatientStore((state) => state.updatePatient)
  const [patient, setPatient] = useState(patients[patients.length - 1] || null)
  
  useEffect(() => {
    if (patients.length > 0) {
      setPatient(patients[patients.length - 1])
    }
  }, [patients])
  
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
    if (!patient) return
    
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
      
      router.push('/patient/waiting')
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Failed to submit check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xl text-foreground mb-4">No patient found</p>
          <motion.button
            onClick={() => router.push('/patient/intake')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Start Intake
          </motion.button>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">20-Minute Check-In</h1>
            <p className="text-primary-foreground/80">Patient: {patient.passportId}</p>
          </div>
          
          <div className="p-8 space-y-6">
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
                  <X className="h-4 w-4 mr-2" />
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
            
            <div className="flex space-x-4 pt-4">
              <motion.button
                onClick={() => router.push('/patient/waiting')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-muted text-muted-foreground py-3 px-4 rounded-lg font-semibold hover:bg-accent transition-all flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}
