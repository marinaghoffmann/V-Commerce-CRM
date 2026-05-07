interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="mb-6 pl-24">
      <h1 className="text-3xl font-bold text-gray-900 ">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};