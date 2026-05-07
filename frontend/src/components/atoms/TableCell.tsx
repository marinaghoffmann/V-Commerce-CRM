export function TableCell({ children }: { children: React.ReactNode }) {
  return (
        <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700">
        {children}
        </td>
    );
}