import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "../components/layout/Sidebar"
import { Navbar } from "../components/layout/Navbar"
import { Footer } from "../components/layout/Footer"
import Breadcrumbs from "../components/routing/Breadcrumbs"
import { motion } from "framer-motion"

export default function AppLayout() {
  const location = useLocation()
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 relative overflow-y-auto focus:outline-none flex flex-col bg-background/50">
          <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <Breadcrumbs />
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
