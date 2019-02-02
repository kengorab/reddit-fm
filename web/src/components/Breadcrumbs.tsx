import * as React from 'react'
import { Breadcrumb } from 'antd'
import { Link } from 'react-router-dom'

interface Props {
  items: Array<{ label: string, href: string }>
}

export function Breadcrumbs({ items }: Props) {
  return (
    <Breadcrumb style={{ marginTop: 12, marginBottom: 12 }}>
      {items.map(({ label, href }, idx) => {
        const color = idx === items.length - 1 ? 'rgba(255, 255, 255, 0.65)' : 'inherit'
        return (
          <Breadcrumb.Item key={label}>
            <Link to={href} style={{ color }}>{label}</Link>
          </Breadcrumb.Item>
        )
      })}
    </Breadcrumb>
  )
}
