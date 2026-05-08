export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="hover:bg-gray-100">
      {children}
    </tr>
  );
}