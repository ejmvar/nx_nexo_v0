import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={badgeClasses}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};