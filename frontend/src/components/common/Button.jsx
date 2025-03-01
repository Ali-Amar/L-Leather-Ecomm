const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    type = 'button',
    ...props
  }) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
      secondary: 'bg-white text-primary border border-primary hover:bg-gray-50 focus:ring-primary',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };
  
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
  
    return (
      <button
        type={type}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;