import React from "react"
import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-muted p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">GCI Platform</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
