import { cn } from '../../utils/cn';

interface DataTableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
}

export function DataTable({ headers, children, className, ...props }: DataTableProps) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {headers.map((header, idx) => (
              <th key={idx} className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function DataTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props}>
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props}>
      {children}
    </td>
  );
}
