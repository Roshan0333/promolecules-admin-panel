import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function TopProducts({ products }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
        <a href="/admin/ecommerce/products" className="text-xs font-medium text-primary hover:underline">
          View All
        </a>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="w-full">
          {/* <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className="pr-6">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0 rounded-lg border border-border/60">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                          {initials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-foreground">{p.price}</span>
                    {p.discount != null && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        -{p.discount}%
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.sold}</TableCell>
                  <TableCell className="pr-6">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/15 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      {p.orders}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}