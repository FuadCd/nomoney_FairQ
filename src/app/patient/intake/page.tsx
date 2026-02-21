'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { api } from '../../../lib/api/api'
import { usePatientStore } from '../../../lib/store/patientStore'
import { ALBERTA_HOSPITALS } from '../../../lib/data/albertaERs'
import type { VulnerabilityProfile, AlbertaHospitalKey } from '../../../types'
import { cn } from '@/lib/utils/cn'

export default function PatientIntakePage() {
  const router = useRouter()
  const addPatient = usePatientStore((state) => state.addPatient)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Context & Risk
  const [hospitalKey, setHospitalKey] = useState<AlbertaHospitalKey>('uofa')
  const [discomfortLevel, setDiscomfortLevel] = useState(3)
  const [intendsToStay, setIntendsToStay] = useState<boolean | null>(null)
  
  // Step 2: Accessibility Profile
  const [profile, setProfile] = useState<VulnerabilityProfile>({})
  
  const hospital = ALBERTA_HOSPITALS[hospitalKey]
  const estimatedCtasLevel = 6 - discomfortLevel
  
  const handleProfileChange = (key: keyof VulnerabilityProfile, value: boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }
  
  const handleSubmit = async () => {
    if (intendsToStay === null) {
      alert('Please indicate if you are planning to stay.')
      return
    }
    
    setLoading(true)
    try {
      const vulnResponse = await api.computeVulnerability({ profile })
      const vulnerabilityMultiplier = vulnResponse.vulnerabilityMultiplier
      
      const burdenResponse = await api.computeBurden({
        facilityId: hospitalKey,
        profile,
        estimatedCtasLevel,
        waitTimeMinutes: 0,
        checkInResponses: [],
      })
      
      const patientId = uuidv4()
      const passportId = `A${Date.now().toString(36).toUpperCase().slice(-7)}`
      
      const patient = {
        id: patientId,
        passportId,
        assignedHospitalKey: hospitalKey,
        assignedHospitalName: hospital.name,
        ctasLevel: estimatedCtasLevel,
        chiefComplaint: '',
        selfReportedUrgency: (discomfortLevel <= 2 ? 'low' : discomfortLevel === 3 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
        accessibilityProfile: profile,
        vulnerabilityScore: (vulnerabilityMultiplier - 1) / 1.5,
        arrivedAt: new Date().toISOString(),
        minutesWaited: 0,
        checkIns: [],
        burden: burdenResponse.burden,
        alertStatus: burdenResponse.alertStatus,
        suggestion: null,
        equityGapScore: burdenResponse.equityGapScore,
        disengagementWindowMinutes: burdenResponse.disengagementWindowMinutes,
        suggestAmberCheckIn: burdenResponse.suggestAmberCheckIn,
        burdenCurve: burdenResponse.burdenCurve,
        baselineCurve: burdenResponse.baselineCurve,
      }
      
      addPatient(patient)
      router.push('/patient/waiting')
    } catch (error) {
      console.error('Error submitting intake:', error)
      alert('Failed to submit intake. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const activeFlagsCount = Object.values(profile).filter(Boolean).length
  
  const steps = [
    { num: 1, label: 'Context & Risk' },
    { num: 2, label: 'Accessibility' },
    { num: 3, label: 'Confirm' },
  ]
  
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-8">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                      step >= s.num
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                  </motion.div>
                  <span className={cn(
                    "mt-2 text-xs font-medium",
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2 transition-all",
                    step > s.num ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              Patient Accessibility Intake
            </h1>
            <p className="text-primary-foreground/80">
              {step === 1 && 'Step 1: Context & Risk'}
              {step === 2 && 'Step 2: Accessibility Profile'}
              {step === 3 && 'Step 3: Confirm & Check In'}
            </p>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Context & Risk */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Hospital
                    </label>
                    <select
                      value={hospitalKey}
                      onChange={(e) => setHospitalKey(e.target.value as AlbertaHospitalKey)}
                      className={cn(
                        "w-full px-4 py-3 border-2 border-input bg-background rounded-lg",
                        "text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                        "transition-all"
                      )}
                    >
                      {Object.values(ALBERTA_HOSPITALS).map((h) => (
                        <option key={h.key} value={h.key}>
                          {h.name} ({h.city})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected wait: {hospital.waitMinutes} minutes
                    </p>
                  </div>
                  
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
                  
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Are you thinking about leaving?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setIntendsToStay(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "py-4 px-4 rounded-lg font-semibold transition-all",
                          intendsToStay === true
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        )}
                      >
                        <Check className="h-4 w-4 inline mr-2" />
                        Staying
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setIntendsToStay(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "py-4 px-4 rounded-lg font-semibold transition-all",
                          intendsToStay === false
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        )}
                      >
                        ⚠ Thinking of leaving
                      </motion.button>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setStep(2)}
                    disabled={intendsToStay === null}
                    whileHover={{ scale: intendsToStay !== null ? 1.02 : 1 }}
                    whileTap={{ scale: intendsToStay !== null ? 0.98 : 1 }}
                    className={cn(
                      "w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold",
                      "hover:bg-primary/90 transition-all shadow-lg shadow-primary/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center"
                    )}
                  >
                    Continue to Accessibility Profile
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </motion.button>
                </motion.div>
              )}
              
              {/* Step 2: Accessibility Profile */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-foreground font-medium">
                      Please indicate any accessibility needs that may affect your wait experience:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'mobility' as const, label: 'Mobility Impairment', desc: 'Do you use a wheelchair or walking aid?', icon: '🦽' },
                      { key: 'chronicPain' as const, label: 'Chronic Pain', desc: 'Do you have ongoing pain that makes waiting difficult?', icon: '💊' },
                      { key: 'sensory' as const, label: 'Sensory Sensitivity', desc: 'Do loud environments cause distress?', icon: '🔊' },
                      { key: 'cognitive' as const, label: 'Cognitive Overload', desc: 'Do busy environments make it hard to process information?', icon: '🧠' },
                      { key: 'language' as const, label: 'Language Barrier', desc: 'Would you benefit from translation assistance?', icon: '🌐' },
                      { key: 'alone' as const, label: 'No Support Person', desc: 'Would you like a support person to stay with you?', icon: '👤' },
                    ].map(({ key, label, desc, icon }) => (
                      <motion.label
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "flex items-start space-x-4 p-5 border-2 rounded-lg cursor-pointer transition-all",
                          profile[key]
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={profile[key] || false}
                          onChange={(e) => handleProfileChange(key, e.target.checked)}
                          className="mt-1 h-5 w-5 text-primary focus:ring-primary border-input rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-2xl">{icon}</span>
                            <span className="font-semibold text-foreground">{label}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{desc}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                  
                  {activeFlagsCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                    >
                      <p className="text-sm text-foreground">
                        <strong>{activeFlagsCount}</strong> accessibility {activeFlagsCount === 1 ? 'need' : 'needs'} selected
                      </p>
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-4 pt-4">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-muted text-muted-foreground py-4 px-6 rounded-lg font-semibold hover:bg-accent transition-all flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </motion.button>
                    <motion.button
                      onClick={() => setStep(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                    >
                      Review & Confirm
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: Confirm */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Accessibility Passport</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hospital:</span>
                        <span className="font-semibold text-foreground">{hospital.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discomfort Level:</span>
                        <span className="font-semibold text-foreground">{discomfortLevel}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated CTAS:</span>
                        <span className="font-semibold text-foreground">{estimatedCtasLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Planning to Stay:</span>
                        <span className="font-semibold text-foreground">{intendsToStay ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <span className="text-muted-foreground">Accessibility Needs:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(profile).filter(([, v]) => v).map(([key]) => (
                            <span key={key} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                          {activeFlagsCount === 0 && (
                            <span className="text-muted-foreground italic">None selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={() => setStep(2)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-muted text-muted-foreground py-4 px-6 rounded-lg font-semibold hover:bg-accent transition-all flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </motion.button>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className={cn(
                        "flex-1 bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold",
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
                          Confirm and Check In
                          <Check className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
