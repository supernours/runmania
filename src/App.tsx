import { Suspense } from 'react'
import { HashRouter as Router, Link, Route, Routes, useMatch } from 'react-router-dom'
import styled from 'styled-components'
import VehicleScene from './Scene'

import { GlobalStyle, PageStyle } from './styles'

const Page = styled(PageStyle)`
  padding: 0px;

  & > h1 {
    position: absolute;
    top: 70px;
    left: 60px;
  }

  & > a {
    position: absolute;
    bottom: 60px;
    right: 60px;
    font-size: 1.2em;
  }
`

const defaultName = 'MondayMorning'

function Intro() {
  return (
    <Page>
      <Suspense fallback={null}>
        <VehicleScene />
      </Suspense>
    </Page>
  )
}

export default function App() {
  return (
    <Router>
      <GlobalStyle />
      <Intro />
    </Router>
  )
}

