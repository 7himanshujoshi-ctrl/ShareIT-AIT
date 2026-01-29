import React from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search for notes, subjects, or keywords..." }) => {
    return (
        <div className={styles.container}>
            <span className={styles.icon}>🔍</span>
            <input
                type="text"
                className={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default SearchBar;
