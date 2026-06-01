import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1d8fe8',
    colorInfo: '#1d8fe8',
    colorBgBase: '#07111d',
    colorTextBase: '#f8fafc',
    borderRadius: 8,
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 8,
      colorBgContainer: 'rgba(255, 255, 255, 0.04)',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
    },
  },
};
