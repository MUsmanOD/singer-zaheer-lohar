export function DataTable({ children, className = "" }) {
  return <div className={`data-table-wrap ${className}`}><table className="data-table">{children}</table></div>;
}
