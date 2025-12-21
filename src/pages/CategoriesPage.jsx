import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../features/categories/categoriesSlice'

const initialForm = { name: '', type: '', comment: '' }

const CategoriesPage = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.categories)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (!form.name || !form.type) {
      setLocalError('Заполните наименование и выберите тип категории')
      return
    }
    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, ...form })).unwrap()
      } else {
        await dispatch(createCategory(form)).unwrap()
      }
      await dispatch(fetchCategories())
      setForm(initialForm)
      setEditingId(null)
    } catch (err) {
      console.error('Failed to submit category form:', err)
    }
  }

  const handleEdit = (cat) => {
    setEditingId(cat._id)
    setForm({ name: cat.name, type: cat.type, comment: cat.comment || '' })
  }

  const loading = status === 'loading'

  const typeOptions = [
    { value: '', label: 'Выберите тип', disabled: true },
    { value: 'income', label: 'Доход' },
    { value: 'expense', label: 'Расход' },
  ]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Категории</h2>
          <p className="muted">Доходы и расходы</p>
        </div>
      </header>

      <div className="card">
        <form className="grid" onSubmit={handleSubmit}>
          <Input
            label="Название категории"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Напр. Зарплата"
          />
          <Select
            label="Тип категории"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={typeOptions}
          />
          <Input
            label="Комментарий"
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            required={false}
            placeholder="Опционально"
          />
          <Button type="submit" disabled={loading}>
            {editingId ? 'Save' : 'Add'}
          </Button>
        </form>
        {loading && <Loader />}
        {(error || localError) && <p className="error-text">{localError || error}</p>}
      </div>

      <div className="card list">
        {items.length === 0 && <p className="muted">Пока нет категорий</p>}
        {items.map((cat) => (
          <div key={cat._id} className="list-row">
            <div>
              <div className="list-title">{cat.name}</div>
              <div className="muted small">Type: {cat.type}</div>
              {cat.comment && <div className="small">{cat.comment}</div>}
            </div>
            <div className="list-actions">
              <Button onClick={() => handleEdit(cat)}>Edit</Button>
              <Button onClick={() => dispatch(deleteCategory(cat._id))} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoriesPage

