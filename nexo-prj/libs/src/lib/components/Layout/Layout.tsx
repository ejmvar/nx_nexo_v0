import React from 'react';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {children}
    </div>
  );
};

export interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <header className={`${styles.header} ${className}`}>
      {children}
    </header>
  );
};

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = '',
  collapsed = false
}) => {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${className}`}>
      {children}
    </aside>
  );
};

export interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export const Main: React.FC<MainProps> = ({
  children,
  className = ''
}) => {
  return (
    <main className={`${styles.main} ${className}`}>
      {children}
    </main>
  );
};

export interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      {children}
    </footer>
  );
};