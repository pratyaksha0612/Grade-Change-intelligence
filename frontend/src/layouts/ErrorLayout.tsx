import React from "react"
import { useRouteError, isRouteErrorResponse } from "react-router-dom"

export default function ErrorLayout() {
  const error = useRouteError()

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-background p-4 text-center">
      <h1 className="text-4xl font-bold text-destructive mb-4">Oops!</h1>
      <p className="text-lg text-muted-foreground mb-6">Sorry, an unexpected error has occurred.</p>
      <div className="p-4 bg-muted border border-border rounded-md text-sm text-left max-w-lg w-full overflow-auto">
        <code className="text-destructive font-mono">
          {isRouteErrorResponse(error) ? (
            `${error.status} ${error.statusText}`
          ) : error instanceof Error ? (
            error.message
          ) : (
            'Unknown Error'
          )}
        </code>
      </div>
      <a href="/" className="mt-8 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        Return to Dashboard
      </a>
    </div>
  )
}
