interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_CLASSES = {
  primary: 'bg-green-600 hover:bg-green-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const SIZE_CLASSES = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={`rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`} {...props} />;
}
