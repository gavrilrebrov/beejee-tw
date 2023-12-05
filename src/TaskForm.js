import { useState, useRef, useEffect } from 'react'
import Cookies from 'js-cookie'

import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { Checkbox } from 'primereact/checkbox'

import { useApp, useAppDispatch } from './AppContext'

export default function TaskForm() {
  const app = useApp()
  const dispatch = useAppDispatch()
  const toast = useRef(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [isDone, setIsDone] = useState(false)

  function closeModal() {
    dispatch({
      type: 'setTaskModal',
      value: false,
    })
  }

  async function submitForm(e) {
    e.preventDefault()

    let url = '/api/tasks'

    if (app.task) url += `/${app.task.id}`

    const res = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: app.admin ? `Bearer ${Cookies.get('token')}` : undefined
      },
      body: JSON.stringify({
        name,
        email,
        text,
        isDone,
      })
    })

    if (res.ok) {
      toast.current.show({
        severity: 'success',
        detail: app.task ? 'Задача обновлена' : 'Задача успешно создана'
      })

      dispatch({
        type: 'setTaskModal',
        value: false,
      })
    } else {
      const err = await res.text()

      toast.current.show({
        severity: 'error',
        detail: err,
      })
    }
  }

  useEffect(() => {
    if (app.task) {
      setText(app.task.text)
      setIsDone(app.task.isDone)
    } else {
      setText('')
      setEmail('')
      setName('')
      setIsDone(false)
    }
  }, [app.task])

  useEffect(() => {
    if (!app.taskModal && !app.task) {
      setText('')
      setEmail('')
      setName('')
      setIsDone(false)
    }
  }, [app.taskModal])

  return (
    <>
      <Dialog visible={app.taskModal}
        header={app.task ? `Задача #${app.task.id}` : 'Новая задача'}
        onHide={closeModal}
        className="w-full max-w-screen-sm"
      >
        <form className="space-y-6 py-1" onSubmit={submitForm}>
          {app.task && app.admin && (
            <label className="flex items-center gap-x-2">
              <Checkbox checked={isDone} onChange={e => setIsDone(e.checked)} />
              <span>Задача выполнена</span>
            </label>
          )}

          {!app.task && (
            <label className="flex flex-col gap-y-2">
              <div>Имя пользователя</div>
              <InputText required value={name} onChange={e => setName(e.target.value)} />
            </label>
          )}

          {!app.task && (
            <label className="flex flex-col gap-y-2">
              <div>E-mail</div>
              <InputText required type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
          )}

          <label className="flex flex-col gap-y-2">
            <div>Текст задачи</div>
            <InputTextarea required value={text} onChange={e => setText(e.target.value)} />
          </label>

          <Button type="submit">
            {app.task ? 'Обновить' : 'Создать'}
          </Button>
        </form>
      </Dialog>

      <Toast ref={toast} />
    </>
  )
}