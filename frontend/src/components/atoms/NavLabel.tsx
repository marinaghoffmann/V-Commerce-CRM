interface NavLabelProps {
  children: string;
}

export function NavLabel({ children }: NavLabelProps) {
  return (
    <span className="text-sm font-semibold whitespace-nowrap leading-none">
      {children}
    </span>
  );
}
