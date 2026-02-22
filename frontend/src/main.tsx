import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import uzUZ from 'antd/locale/uz_UZ'
import App from './App'
import './styles/index.css'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import './i18n'
import { useTranslation } from 'react-i18next'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

// === DARK THEME ===
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

// === LIGHT THEME ===
const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4f46e5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorSuccess: '#16a34a',
    colorError: '#dc2626',
    colorWarning: '#d97706',
    colorInfo: '#4f46e5',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
    Menu: {
      itemBg: '#ffffff',
      itemSelectedBg: 'rgba(79, 70, 229, 0.1)',
      itemHoverBg: 'rgba(79, 70, 229, 0.05)',
      itemSelectedColor: '#4f46e5',
    },
    Card: {
      colorBgContainer: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: '#f1f5f9',
      rowHoverBg: '#f8fafc',
    },
    Button: {
      primaryShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
    },
    Input: {
      colorBgContainer: '#ffffff',
    },
    Select: {
      colorBgContainer: '#ffffff',
    },
    Modal: {
      contentBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
}

const ThemedApp = () => {
  const { themeMode } = useTheme();
  const { i18n } = useTranslation();

  // Toggle body class for any global CSS adjustments needed outside logic
  React.useEffect(() => {
    document.body.className = themeMode === 'dark' ? 'dark-theme' : 'light-theme';
  }, [themeMode]);

  const antdLocale = i18n.language === 'uz' ? uzUZ : ruRU;

  return (
    <ConfigProvider theme={themeMode === 'dark' ? darkTheme : lightTheme} locale={antdLocale}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.Suspense>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
