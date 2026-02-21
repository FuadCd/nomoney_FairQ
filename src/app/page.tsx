'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Activity, Users, TrendingUp, CheckCircle, Star, Zap, BarChart3, Heart } from 'lucide-react'
import { authService } from '../lib/auth/auth'
import { ThemeToggle } from '../components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { cn } from '@/lib/utils/cn'

export default function HomePage() {
  const router = useRouter()
  const [hospitalCode, setHospitalCode] = useState('')
  const [error, setError] = useState('')
  
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!authService.validateHospitalCode(hospitalCode)) {
      setError('Invalid hospital code. Please enter 001-005.')
      return
    }
    
    if (authService.setStaffSession(hospitalCode)) {
      router.push('/staff')
    } else {
      setError('Failed to authenticate. Please try again.')
    }
  }
  
  const handlePatientClick = () => {
    authService.setPatientSession()
    router.push('/patient')
  }
  
  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Real-Time Monitoring',
      description: 'Track patient burden and accessibility needs in real-time with live updates.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Equity First',
      description: 'Ensure fair treatment for all patients regardless of accessibility barriers.',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with comprehensive analytics and burden modeling.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Patient-Centered',
      description: 'Empower patients with accessibility passports and transparent wait times.',
    },
  ]
  
  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '5+', label: 'Hospitals' },
    { value: '24/7', label: 'Support' },
    { value: '1000+', label: 'Patients Served' },
  ]
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background bg-[length:200%_200%]"
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by AI & Real-Time Analytics</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
              AccessER
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light max-w-3xl mx-auto">
              Revolutionizing Emergency Care Through
              <span className="text-primary font-semibold"> Accessibility Equity</span>
            </p>
            
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-12">
              Real-time burden modeling and accessibility support for emergency departments.
              Ensuring fair, equitable care for every patient.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.button
                onClick={handlePatientClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  I'm a Patient
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-primary/80"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button
                onClick={() => document.getElementById('staff-login')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-card border-2 border-border text-foreground rounded-lg font-semibold text-lg hover:bg-accent transition-all"
              >
                Staff Login
              </motion.button>
            </div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-black text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Healthcare Excellence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to ensure equitable emergency care
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-xl text-muted-foreground">Join leading hospitals using AccessER</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { name: 'University of Alberta Hospital', city: 'Edmonton' },
              { name: 'Royal Alexandra Hospital', city: 'Edmonton' },
              { name: 'Grey Nuns Community Hospital', city: 'Edmonton' },
            ].map((hospital, idx) => (
              <motion.div
                key={hospital.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 rounded-lg bg-card border border-border"
              >
                <div className="text-2xl mb-2">🏥</div>
                <div className="font-semibold text-foreground">{hospital.name}</div>
                <div className="text-sm text-muted-foreground">{hospital.city}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center"
          >
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-lg text-foreground mb-2 font-semibold">
              "AccessER has transformed how we approach patient equity in our emergency department."
            </p>
            <p className="text-sm text-muted-foreground">— Emergency Department Director</p>
          </motion.div>
        </div>
      </section>

      {/* Staff Login Section */}
      <section id="staff-login" className="relative z-10 py-20 px-4 bg-background/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-border shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Staff Access</CardTitle>
                <CardDescription className="text-base">
                  Enter your hospital code to access the staff dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStaffLogin} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={hospitalCode}
                      onChange={(e) => setHospitalCode(e.target.value.toUpperCase())}
                      placeholder="Enter hospital code (001-005)"
                      maxLength={3}
                      className={cn(
                        "w-full px-4 py-4 rounded-lg border-2 border-input bg-background",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                        "text-center text-2xl font-mono tracking-widest",
                        "transition-all duration-200"
                      )}
                    />
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm mt-2 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-lg flex items-center justify-center"
                  >
                    Access Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </form>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-2">Hospital Codes:</p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                    <span>001 - U of A</span>
                    <span>•</span>
                    <span>002 - Royal Alex</span>
                    <span>•</span>
                    <span>003 - Grey Nuns</span>
                    <span>•</span>
                    <span>004 - Misericordia</span>
                    <span>•</span>
                    <span>005 - Sturgeon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-2">
            AccessER does not diagnose, prioritize treatment, or provide medical advice.
          </p>
          <p className="text-xs text-muted-foreground/80">
            It operates as an accessibility and system-equity support layer.
          </p>
        </div>
      </footer>
    </div>
  )
}
