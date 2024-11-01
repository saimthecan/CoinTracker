import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType(); // PUSH, POP, veya REPLACE

  useEffect(() => {
    // Sadece ileri yönlü gezinmelerde (PUSH) en üste kaydırma yap
    if (navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
