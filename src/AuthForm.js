import { useState, useRef } from 'react'
import Cookies from 'js-cookie'

import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'

import { useApp, useAppDispatch } from './AppContext'

export default function AuthForm() {
  const app = useApp()
  const dispatch = useAppDispatch()
  const toast = useRef(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function submitForm(e) {
    e.preventDefault()

    const res = await fetch('/api/auth', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      })
    })

    if (res.ok) {
      const json = await res.json()

      Cookies.set('token', json.token)

      dispatch({
        type: 'setAdmin',
        value: json.admin
      })

      dispatch({
        type: 'setAuthModal',
        value: false,
      })
    } else {
      const err = await res.text()

      toast.current.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: err
      })
    }
  }

  function closeModal() {
    dispatch({ type: 'setAuthModal', value: false })
  }

  return (
    <>
      <Dialog visible={app.authModal}
        header="Авторизация"
        onHide={closeModal}
      >
        <form className="space-y-6" onSubmit={submitForm}>
          <label className="flex flex-col gap-y-2">
            <div>Логин</div>
            <InputText required value={username} onChange={e => setUsername(e.target.value)} />
          </label>

          <label className="flex flex-col gap-y-2">
            <div>Пароль</div>
            <Password required
              value={password}
              onChange={e => setPassword(e.target.value)}
              feedback={false}
            />
          </label>

          <Button type="submit">
            Войти
          </Button>
        </form>
      </Dialog>

      <Toast ref={toast} />
    </>
  )
}