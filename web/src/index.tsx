import React from 'react'
import { render } from 'react-dom'
import dayjs from 'dayjs'
// @ts-ignore (There's no type information for the plugin)
import relativeTime from 'dayjs/plugin/relativeTime'

import App from './App'

import './index.css'

dayjs.extend(relativeTime)

render(
  <App/>,
  document.getElementById('root')
)
