import React from 'react';
import styles from './MasonryGrid.module.css';

interface MasonryGridProps {
    children: React.ReactNode;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ children }) => {
    return (
        <div className={styles.grid}>
            {children}
        </div>
    );
};

export default MasonryGrid;
