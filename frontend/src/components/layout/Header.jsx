import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, User, Search, X } from 'lucide-react';
import Logo from '../common/Logo';
import ProductSearch from '../product/ProductSearch';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import { selectCartCount } from '../../features/cart/cartSlice';

const Header = ({ toggleSidebar }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectUser);

  // Define main navigation
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
  ];

  // Add admin navigation if user is admin
  const adminNavigation = user?.role === 'admin' ? [
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Manage Products', href: '/admin/products' },
    { name: 'Manage Orders', href: '/admin/orders' },
    { name: 'Inventory', href: '/admin/inventory' },
  ] : [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const IconButton = ({ children, onClick, badge }) => (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[#F5F0E9] rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 active:scale-95"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-scale-in">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : 'bg-white'
        }`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left Section - Menu Button & Logo */}
            <div className="flex items-center gap-4">
              <IconButton onClick={toggleSidebar}>
                <Menu className="w-6 h-6 text-gray-700" />
              </IconButton>
              <div className="transform transition-transform duration-300 hover:scale-105">
                <Logo className="w-12 h-12" />
              </div>
            </div>

            {/* Center section - Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Main navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-[#8B4513] relative group ${
                    location.pathname === item.href ? 'text-[#8B4513]' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#8B4513] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              ))}

              {/* Admin navigation */}
              {user?.role === 'admin' && (
                <>
                  <span className="h-6 w-px bg-gray-200" />
                  
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-sm font-medium transition-all duration-300 hover:text-[#8B4513] relative group ${
                        location.pathname.startsWith(item.href) ? 'text-[#8B4513]' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#8B4513] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Right section - Search, User & Cart */}
            <div className="flex items-center gap-4">
              <IconButton onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5 text-gray-700" />
              </IconButton>

              <Link to="/profile">
                <IconButton>
                  <User className="w-5 h-5 text-gray-700" />
                </IconButton>
              </Link>

              <Link to="/cart">
                <IconButton badge={cartCount}>
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </IconButton>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isSearchOpen 
            ? 'opacity-50 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSearchOpen(false)}
      >
        <div 
          className={`w-full max-w-3xl mx-auto mt-20 transform transition-transform duration-300 ${
            isSearchOpen ? 'translate-y-0' : '-translate-y-10'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="relative p-4">
              <IconButton
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-4"
              >
                <X className="w-5 h-5 text-gray-500" />
              </IconButton>
              <ProductSearch 
                onClose={() => setIsSearchOpen(false)}
                className="pt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;