import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { generateTokenGradient, getRiskColor, getPerformanceColor } from "@/lib/utils";
import { useState } from "react";

interface TokenTableProps {
  searchTerm: string;
}

export default function TokenTable({ searchTerm }: TokenTableProps) {
  const [exchangeFilter, setExchangeFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const filteredTokens = tokens?.filter((token: any) => {
    const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExchange = exchangeFilter === "all" || token.exchange.toLowerCase().includes(exchangeFilter.toLowerCase());
    const matchesSector = sectorFilter === "all" || token.sector.toLowerCase().includes(sectorFilter.toLowerCase());
    
    return matchesSearch && matchesExchange && matchesSector;
  });

  if (isLoading) {
    return (
      <Card className="bg-dark-card border-dark-border mb-8">
        <CardHeader>
          <CardTitle>Failed Token Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-card border-dark-border mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Failed Token Analysis</CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
              <SelectTrigger className="bg-dark-bg border-dark-border w-40">
                <SelectValue placeholder="All Exchanges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exchanges</SelectItem>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="bybit">Bybit</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="bg-dark-bg border-dark-border w-40">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
                <SelectItem value="layer-1">Layer-1</SelectItem>
                <SelectItem value="layer-2">Layer-2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-border">
                <TableHead className="text-neutral-gray">Token</TableHead>
                <TableHead className="text-neutral-gray">Exchange</TableHead>
                <TableHead className="text-neutral-gray">Listing Date</TableHead>
                <TableHead className="text-neutral-gray text-right">Initial Float</TableHead>
                <TableHead className="text-neutral-gray text-right">Peak FDV</TableHead>
                <TableHead className="text-neutral-gray text-right">Listing Price</TableHead>
                <TableHead className="text-neutral-gray text-right">Current Price</TableHead>
                <TableHead className="text-neutral-gray text-right">Performance</TableHead>
                <TableHead className="text-neutral-gray text-center">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens?.map((token: any) => (
                <TableRow key={token.id} className="border-dark-border hover:bg-dark-bg/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${generateTokenGradient(token.symbol)} rounded-full flex items-center justify-center text-xs font-bold`}>
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-neutral-gray">{token.sector}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{token.exchange}</TableCell>
                  <TableCell className="text-sm">{token.listingDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${parseFloat(token.initialFloat) < 10 ? 'bg-loss-red/20 text-loss-red border-loss-red/30' : 'bg-warning-orange/20 text-warning-orange border-warning-orange/30'}`}
                    >
                      {token.initialFloat}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{token.peakFdv}</TableCell>
                  <TableCell className="text-right text-sm">${token.listingPrice}</TableCell>
                  <TableCell className="text-right text-sm">${token.currentPrice}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${getPerformanceColor(token.performancePercent)}`}>
                      {token.performancePercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getRiskColor(token.riskLevel)}>
                      {token.riskLevel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
