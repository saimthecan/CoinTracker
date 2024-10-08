import React, { useState, useEffect } from 'react';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onVisibilityChange = () => {},
}) => {
  const [showPagination, setShowPagination] = useState(false);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Sayfanın en sonuna yaklaşıldığında butonları göster
      if (windowHeight + scrollTop >= fullHeight - 50) {
        setShowPagination(true);
        onVisibilityChange(true); // Pagination'ın gösterildiğini bildir
      } else {
        setShowPagination(false);
        onVisibilityChange(false); // Pagination'ın gizlendiğini bildir
      }
    };

    const checkScrollability = () => {
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // Eğer sayfa kaydırılabilir değilse pagination'ı göster
      if (fullHeight <= windowHeight) {
        setShowPagination(true);
        onVisibilityChange(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // İlk yükleme sırasında sayfanın kaydırılabilir olup olmadığını kontrol et
    checkScrollability();

    // Cleanup scroll event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onVisibilityChange]);

  return (
    <div className={`pagination ${showPagination ? 'visible' : 'hidden'}`}>
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)}>-</button>
      )}

      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          className={currentPage === index + 1 ? 'active' : ''}
        >
          {index + 1}
        </button>
      ))}

      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)}>+</button>
      )}
    </div>
  );
};

export default Pagination;
