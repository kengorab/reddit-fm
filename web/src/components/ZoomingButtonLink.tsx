import * as React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const ZoomingButtonLink = styled(Link)`
  padding: 12px 24px;
  border: 2px solid rgba(255, 255, 255, .65);
  border-radius: 6px;
  text-align: center;
  font-size: 18px;
  text-decoration: none;
  color: rgba(255, 255, 255, .65);
  cursor: pointer;
  transition: all 200ms;
  
  &:focus {
    text-decoration: none;
  }

  &:hover {
    border: 2px solid #1DA57A;
    color: #1DA57A;
    background: #031903;
    transform: scale(1.0125);
  }
`
