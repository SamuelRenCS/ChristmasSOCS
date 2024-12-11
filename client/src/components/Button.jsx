export default function Button({ type, text, onClick }) {
    const styles = {
        button: {
            padding: '16px 40px',
            border: '1px solid #2F2F30',
            borderRadius: '30px',
            backgroundColor: '#2F2F30',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            width: '250px',
        }
    }
    return (
        <button type={type} onClick={onClick} style={styles.button}>{text}</button>
    );
}
