// Shotaro Nakamura
import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  formType,
}) => {

    const styles = { 
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: formType === 'login' ? '30px' : '12px',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            color: '#344054',
            fontSize: '0.9rem',
        },
        input: {
            width: '80%',
            padding: '11px',
            border: '1px solid #667085',
            borderRadius: '30px'
        }
    }
  return (
    <div className="input-group" style={styles.inputGroup}>
      {label && (
        <label htmlFor={name} style={styles.label}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        style={styles.input}
        required
      />
    </div>
  );
};

export default Input;
