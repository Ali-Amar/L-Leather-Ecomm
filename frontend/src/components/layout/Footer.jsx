import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  const navigation = {
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping & Returns', href: '/shipping' },
    ],
    company: [
      { name: 'Blog', href: '/blog' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-gray-50 w-full">
      <div className="w-full px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="md:col-span-6 lg:col-span-6">
            <Logo />
            <p className="mt-4 text-gray-600 max-w-md">
              Discover luxury leather craftsmanship with L'ardene. Each piece tells a story of quality, elegance, and timeless style.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="https://instagram.com/lardeneleather/" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-serif text-lg font-medium mb-4">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-600 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-serif text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-600 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 text-sm py-4">
            © {new Date().getFullYear()} L'ardene Leather. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;