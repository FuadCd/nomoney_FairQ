'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, Edit } from 'lucide-react'
import { usePatientStore } from '../../../lib/store/patientStore'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export default function PatientWaitingPage() {
  const router = useRouter()
  const patients = usePatientStore((state) => state.patients)
  const [patient, setPatient] = useState(patients[patients.length - 1] || null)
  
  useEffect(() => {
    if (patients.length > 0) {
      setPatient(patients[patients.length - 1])
    }
  }, [patients])
  
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
  
  const statusConfig = {
    GREEN: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
    AMBER: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
    RED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  }
  
  const status = statusConfig[patient.alertStatus]
  const StatusIcon = status.icon
  
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Waiting Room</h1>
            <p className="text-primary-foreground/80">Your Accessibility Passport</p>
          </div>
          
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "rounded-lg p-6 border-2 mb-6",
                status.bg,
                status.border
              )}
            >
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-4xl font-mono font-black text-primary mb-2"
                >
                  {patient.passportId}
                </motion.div>
                <p className="text-sm text-muted-foreground">Your Patient ID</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Hospital:</span>
                  <p className="font-semibold text-foreground">{patient.assignedHospitalName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Time Waited:
                  </span>
                  <p className="font-semibold text-foreground">{patient.minutesWaited} minutes</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Current Burden:</span>
                  <p className={cn(
                    "font-bold text-lg",
                    patient.burden >= 70 ? 'text-red-600'
                    : patient.burden >= 50 ? 'text-amber-600'
                    : 'text-green-600'
                  )}>
                    {Math.round(patient.burden)}/100
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={cn("h-4 w-4", status.color)} />
                    <p className={cn("font-semibold", status.color)}>
                      {patient.alertStatus}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="space-y-4">
              <motion.button
                onClick={() => router.push('/patient/checkin')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                20-Minute Check-In
                <ArrowRight className="h-4 w-4 ml-2" />
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/patient/intake')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-muted text-muted-foreground py-3 px-6 rounded-lg font-semibold hover:bg-accent transition-all flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Profile
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
