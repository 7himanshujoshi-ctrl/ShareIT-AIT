import React from 'react';
import styles from './FilterBar.module.css';

interface FilterBarProps {
    categories: string[];
    selected: string | null;
    onSelect: (category: string | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className={styles.container}>
            <button
                className={`${styles.chip} ${selected === null ? styles.active : ''}`}
                onClick={() => onSelect(null)}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.chip} ${selected === cat ? styles.active : ''}`}
                    onClick={() => onSelect(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
