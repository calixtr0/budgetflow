export type Frequency =
  | 'one-off'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'

export type Category = {
  id: string
  name: string
  colour: string
}

export type Bill = {
  id: string
  name: string
  categoryId: string
  amount: number
  frequency: Frequency
  dueDay: number
  active: boolean
}

export type Transaction = {
  id: string
  date: string
  description: string
  categoryId: string
  amount: number
  type: 'expense' | 'income'
}

export type Budget = {
  id: string
  categoryId: string
  month: string
  amount: number
}