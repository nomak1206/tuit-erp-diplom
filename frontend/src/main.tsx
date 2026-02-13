import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorBgContainer: '#1a1a2e',
    colorBgElevated: '#1e1e38',
    colorBgLayout: '#0a0a1a',
    colorBorder: '#2d2d4a',
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorSuccess: '#52c41a',
    colorError: '#ff4d4f',
    colorWarning: '#faad14',
    colorInfo: '#6366f1',
  },
  components: {
    Layout: {
      siderBg: '#0f0f23',
      headerBg: '#0f0f23',
      bodyBg: '#0a0a1a',
    },
    Menu: {
      darkItemBg: '#0f0f23',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.15)',
      darkItemHoverBg: 'rgba(99, 102, 241, 0.08)',
      darkItemSelectedColor: '#818cf8',
    },
    Card: {
      colorBgContainer: '#1a1a2e',
    },
    Table: {
      colorBgContainer: '#1a1a2e',
      headerBg: '#141428',
      rowHoverBg: 'rgba(99, 102, 241, 0.06)',
    },
    Button: {
      primaryShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
    },
    Input: {
      colorBgContainer: '#141428',
    },
    Select: {
      colorBgContainer: '#141428',
    },
    Modal: {
      contentBg: '#1a1a2e',
      headerBg: '#1a1a2e',
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={darkTheme} locale={ruRU}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
