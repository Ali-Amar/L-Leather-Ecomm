import { Fragment } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Home, 
  ShoppingBag, 
  User, 
  Package, 
  LogOut,
  LayoutGrid,
  Box,
  ShoppingCart
} from 'lucide-react';
import { selectUser, logout } from '../../features/auth/authSlice';
import { fetchCategories, selectAllCategories } from '../../features/categories/categorySlice';
import Logo from '../common/Logo';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const categories = useSelector(selectAllCategories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Define main navigation
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    ...(categories?.map(category => ({
      name: category.name,
      href: `/shop?category=${category.id}`,
      icon: Package
    })) || [])
  ];

  // Add admin navigation if user is admin
  const adminNavigation = user?.role === 'admin' ? [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutGrid },
    { name: 'Manage Products', href: '/admin/products', icon: Package },
    { name: 'Manage Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/admin/inventory', icon: Box },
  ] : [];

  const accountLinks = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Orders', href: '/orders', icon: Package },
  ];

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
        </Transition.Child>

        {/* Sidebar panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                    {/* Header */}
                    <div className="px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Logo />
                        <button
                          type="button"
                          className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                          onClick={onClose}
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-6 flex-1">
                      {/* Main navigation */}
                      <nav className="px-4 sm:px-6">
                        <div className="space-y-1">
                          {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={`
                                  group flex items-center px-2 py-2 text-base font-medium rounded-md
                                  ${location.pathname === item.href
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                  }
                                `}
                              >
                                <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                                {item.name}
                              </Link>
                            );
                          })}

                          {/* Admin Navigation */}
                          {user?.role === 'admin' && (
                            <>
                              <div className="h-px bg-gray-200 my-4" />
                              <div className="mb-2">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                  Admin
                                </p>
                              </div>
                              {adminNavigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={onClose}
                                    className={`
                                      group flex items-center px-2 py-2 text-base font-medium rounded-md
                                      ${location.pathname.startsWith(item.href)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                      }
                                    `}
                                  >
                                    <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                                    {item.name}
                                  </Link>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </nav>

                      {/* Account section */}
                      {user ? (
                        <div className="mt-10">
                          <div className="px-4 sm:px-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Account
                            </h3>
                            <div className="mt-3 space-y-1">
                              {accountLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={onClose}
                                    className="
                                      group flex items-center px-2 py-2 text-base font-medium 
                                      text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary
                                    "
                                  >
                                    <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                                    {item.name}
                                  </Link>
                                );
                              })}
                              <button
                                onClick={handleLogout}
                                className="
                                  w-full group flex items-center px-2 py-2 text-base font-medium 
                                  text-gray-600 rounded-md hover:bg-gray-50 hover:text-red-600
                                "
                              >
                                <LogOut className="mr-4 h-6 w-6 flex-shrink-0" />
                                Sign out
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-10 px-4 sm:px-6">
                          <Link
                            to="/login"
                            onClick={onClose}
                            className="
                              flex items-center justify-center px-4 py-2 border border-transparent 
                              rounded-md shadow-sm text-base font-medium text-white bg-primary 
                              hover:bg-primary-light
                            "
                          >
                            Sign in
                          </Link>
                          <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link
                              to="/register"
                              onClick={onClose}
                              className="font-medium text-primary hover:text-primary-light"
                            >
                              create an account
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Sidebar;