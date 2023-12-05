import { useEffect, useState, useRef } from 'react'
import qs from 'qs'
import Cookies from 'js-cookie'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { Checkbox } from 'primereact/checkbox'
import { Toast } from 'primereact/toast'

import { useApp, useAppDispatch } from './AppContext'
import TaskForm from './TaskForm'

export default function Tasks() {
  const toast = useRef(null)
  const app = useApp()
  const dispatch = useAppDispatch()
  const [first, setFirst] = useState(0)

  const [query, setQuery] = useState({
    page: 1,
    limit: 3,
    orderBy: null,
    order: null
  })

  async function fetchTasks() {
    const res = await fetch('/api/tasks?' + qs.stringify(query))

    if (res.ok) {
      const json = await res.json()

      dispatch({
        type: 'setTasks',
        value: json,
      })
    }
  }

  useEffect(() => {
    if (!app.taskModal) {
      fetchTasks()

      dispatch({
        type: 'setTask',
        value: null,
      })
    }
  }, [app.taskModal, query])

  function openTaskModal() {
    dispatch({
      type: 'setTaskModal',
      value: true,
    })
  }

  function pageChange(e) {
    setFirst(e.first)

    setQuery({
      ...query,
      page: e.page + 1,
    })
  }

  function statusBody(record) {
    const tag = record.isDone ? <Tag severity="success">выполнено</Tag> : <Tag severity="warning">не выполнено</Tag>

    if (app.admin) {
      return <label className="flex items-center gap-x-2">
        <Checkbox checked={record.isDone} onChange={e => onStatusChange(e, record)} />
        <span>Выполнено</span>
      </label>
    } else {
      return <div className="flex flex-col gap-y-1 items-start">
        {tag}

        {record.isEdited && (
          <Tag>отредактировано администратором</Tag>
        )}
      </div>
    }
  }

  async function onStatusChange(e, record) {
    const res = await fetch(`/api/tasks/${record.id}/status`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`
      },
      body: JSON.stringify({
        isDone: e.checked,
      })
    })

    if (res.ok) {
      toast.current.show({
        severity: 'success',
        detail: 'Задача обновлена',
      })

      fetchTasks()
    }
  }

  function actionsBody(record) {
    return <button className="w-8 h-8 flex items-center justify-center"
      onClick={() => editTask(record)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="m14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
    </button>
  }

  function editTask(record) {
    dispatch({
      type: 'setTask',
      value: record,
    })

    dispatch({
      type: 'setTaskModal',
      value: true,
    })
  }

  function onSort(e) {
    let order

    if (e.sortOrder === 0) order = null
    if (e.sortOrder === 1) order = 'asc'
    if (e.sortOrder === -1) order = 'desc'

    setQuery({
      ...query,
      orderBy: e.sortField,
      order,
    })
  }

  return (
    <>
      <Button size="small" onClick={openTaskModal}>
        Новая задача
      </Button>

      <DataTable value={app.tasks.records}
        onSort={onSort}
        sortField={query.orderBy}
        sortOrder={query.order === 'asc' ? 1 : (
          query.order === 'desc' ? -1 : 0
        )}
      >
        <Column field="name" header="Имя пользователя" sortable />
        <Column field="email" header="Email" sortable />
        <Column header="Текст задачи" field="text" />
        
        <Column header="Статус" field="isDone" body={statusBody} sortable />

        {app.admin && (
          <Column body={actionsBody} />
        )}
      </DataTable>

      {app.tasks.count > query.limit && (
        <Paginator
          totalRecords={app.tasks.count}
          first={first}
          rows={query.limit}
          onPageChange={pageChange}
        />
      )}

      <TaskForm />

      <Toast ref={toast} />
    </>
  )
}