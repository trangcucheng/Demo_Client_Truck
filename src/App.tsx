import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import { ConfigProvider, message, notification } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import deDe from 'antd/lib/locale/de_DE';
import enUS from 'antd/lib/locale/en_US';
import GlobalStyle from './styles/GlobalStyle';
import 'typeface-montserrat';
import 'typeface-lato';
import { AppRouter } from './components/router/AppRouter';
import { useLanguage } from './hooks/useLanguage';
import { useAutoNightMode } from './hooks/useAutoNightMode';
import { usePWA } from './hooks/usePWA';
import { useThemeWatcher } from './hooks/useThemeWatcher';
import { useAppSelector } from './hooks/reduxHooks';
import { themeObject } from './styles/themes/themeVariables';

const host = 'http://localhost:3000';

const App: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const { language } = useLanguage();
  const theme = useAppSelector((state) => state.theme.theme);

  usePWA();

  useAutoNightMode();

  useThemeWatcher();
  useEffect(() => {
    socketRef.current = socketIOClient(host);
    if (socketRef.current) {
      socketRef.current.on('connect', () => {
        console.log('Connect to server');
      });
      socketRef.current?.on('forward_request', (data) => {
        const message_ = `Có yêu cầu đặt ${data?.data?.count} xe với tải trọng ${data?.data?.payload} tấn tới địa chỉ ${data?.data?.address}`;
        notification.info({ message: message_ });
      });
      socketRef.current?.on('warn_to_client_truck', (message_) => {
        notification.error({ message: message_ });
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketRef]);

  return (
    <>
      <meta name="theme-color" content={themeObject[theme].primary} />
      <GlobalStyle />
      <HelmetProvider>
        <ConfigProvider locale={language === 'en' ? enUS : deDe}>
          <AppRouter />
        </ConfigProvider>
      </HelmetProvider>
    </>
  );
};

export default App;
