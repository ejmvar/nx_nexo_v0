import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = [
    styles.input,
    error ? styles.error : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className={styles.errorText}>{error}</p>
      )}
      {helperText && !error && (
        <p className={styles.helperText}>{helperText}</p>
      )}
    </div>
  );
};