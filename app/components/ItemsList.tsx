'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ItemsList() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching items:', error)
      } else {
        setItems(data)
      }
    }

    fetchItems()

    // Set up real-time subscription
    const subscription = supabase
      .channel('items')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          fetchItems() // Refresh items when changes occur
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  )
} 