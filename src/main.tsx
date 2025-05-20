import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
} from '@tanstack/react-router'

import './index.css'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import persistStore from 'redux-persist/es/persistStore'
import reportWebVitals from './reportWebVitals.ts'

import { store } from './redux/redux-store.ts'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { AppWrapper } from './components/common/PageMeta.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { router } from './routes/Routes.tsx'


const persist = persistStore(store);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persist}>
        <ThemeProvider>
          <AppWrapper>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </AppWrapper>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
