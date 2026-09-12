// src/components/Home/FeaturedStatement.jsx
import React from 'react';
import styles from './FeaturedStatement.module.css';

const FeaturedStatement = () => {
  return (
    <section className={styles.featuredStatement}>
      <div className="container">
        <h2>Small sticker. Big billboard. Same energy.</h2>
        <p>Whatever the size of your project, we bring the same attention to detail.</p>
      </div>
    </section>
  );
};

export default FeaturedStatement;