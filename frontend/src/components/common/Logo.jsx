import { Link } from 'react-router-dom';

const Logo = ({ className = 'w-10 h-10' }) => {
  return (
    <Link to="/" className="flex items-center gap-3 text-primary">
      <img 
        src="/images/logo.png"
        alt="L'ardene Logo"
        className={className}
      />
      <span className="font-serif text-xl font-medium tracking-wide">L'ARDENE</span>
    </Link>
  );
};

export default Logo;