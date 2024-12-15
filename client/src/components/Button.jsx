import React from 'react';
export default function Button({ type, text, onClick }) {
    const styles = {
        button: {
            backgroundColor: '#175EAB',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '15px 40px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '20px',
            fontWeight: 'bold',
        }
    }
    return (
        <button type={type} onClick={onClick} style={styles.button}>{text}</button>
    );
}
