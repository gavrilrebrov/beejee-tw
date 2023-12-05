import { useEffect } from 'react'
import Cookies from 'js-cookie'

import { Button } from 'primereact/button'

import { useAppDispatch, useApp } from "./AppContext"
import AuthForm from './AuthForm'


export default function Header() {
  const dispatch = useAppDispatch()
  const app = useApp()

  useEffect(() => {
    fetchAdmin()
  }, [])

  async function fetchAdmin() {
    if (Cookies.get('token')) {
      const res = await fetch('/api/auth', {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      })

      if (res.ok) {
        const json = await res.json()

        dispatch({
          type: 'setAdmin',
          value: json.me
        })
      }
    }
  }

  function openAuthModal() {
    dispatch({ type: 'setAuthModal', value: true, })
  }

  function logout() {
    Cookies.remove('token')
    dispatch({ type: 'setAdmin', value: null })
  }

  return (
    <header className="flex justify-between items-center">
      <div className="font-bold text-2xl">
        Тестовое задание
      </div>

      {app.admin ? (
        <div className="flex items-center gap-x-6">
          <div className="">
            {app.admin.username}
          </div>

          <Button onClick={logout} size="small">
            Выход
          </Button>
        </div>
      ) : (
        <Button onClick={openAuthModal} label="Войти" size="small" />
      )}

      <AuthForm />
    </header>
  )
}