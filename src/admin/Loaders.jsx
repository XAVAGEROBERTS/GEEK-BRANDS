// src/admin/Loaders.jsx
import React from 'react';
import styles from './Loaders.module.css';

export const Spinner = ({ size = 20 }) => (
  <span
    className={styles.spinner}
    style={{ width: size, height: size }}
    aria-label="Loading"
  />
);

export const PageLoader = ({ text = 'Loading...' }) => (
  <div className={styles.pageLoader}>
    <div className={styles.pageLoaderSpinner} />
    <p>{text}</p>
  </div>
);

export const SkeletonList = ({ rows = 4, variant = 'card' }) => (
  <div className={styles.skeletonList}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={styles.skeletonItem}>
        <div className={variant === 'round' ? styles.skelThumbRound : styles.skelThumb} />
        <div className={styles.skelInfo}>
          <div className={styles.skelLine} style={{ width: '40%' }} />
          <div className={styles.skelLine} style={{ width: '70%' }} />
          <div className={styles.skelLine} style={{ width: '55%' }} />
        </div>
        <div className={styles.skelActions}>
          <div className={styles.skelBox} />
          <div className={styles.skelBox} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className={styles.tableWrap}>
    <div className={styles.skeletonTable}>
      <div className={styles.skelTableHead}>
        {['Ref', 'Customer', 'Service', 'Status', 'Progress', 'Artwork'].map((h) => (
          <div key={h} className={styles.skelHeadCell}>{h}</div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skelTableRow}>
          <div className={styles.skelCell} style={{ width: '60px' }} />
          <div className={styles.skelCell} style={{ width: '140px' }} />
          <div className={styles.skelCell} style={{ width: '180px' }} />
          <div className={styles.skelCellPill} />
          <div className={styles.skelCell} style={{ width: '40px' }} />
          <div className={styles.skelCell} style={{ width: '80px' }} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonForm = ({ fields = 6 }) => (
  <div className={styles.skeletonForm}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className={styles.skelField}>
        <div className={styles.skelLabel} />
        <div className={styles.skelInput} />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className={styles.dashSkeleton}>
    <div className={styles.skelDashTitle} />
    <div className={styles.skelDashSubtitle} />
    <div className={styles.skelStatsGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skelStatCard}>
          <div className={styles.skelStatIcon} />
          <div className={styles.skelStatText}>
            <div className={styles.skelLine} style={{ width: '40px' }} />
            <div className={styles.skelLine} style={{ width: '80px' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);