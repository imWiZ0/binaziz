"use client"

import { useState } from "react"
import { Suspense } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 py-8">
      <Suspense>
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </Suspense>
    </div>
  )
}

export default LoginTemplate
