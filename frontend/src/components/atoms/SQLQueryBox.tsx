interface SQLQueryBoxProps {
  query: string;
}

export function SQLQueryBox({ query }: SQLQueryBoxProps) {
  return (
    <div className="bg-gray-200 px-4 py-3 rounded-lg">
      <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
        Consulta SQL
      </p>
      <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words font-mono">
        {query}
      </pre>
    </div>
  );
}
