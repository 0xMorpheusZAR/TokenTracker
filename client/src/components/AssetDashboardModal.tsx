import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { UnifiedAssetDashboard } from './UnifiedAssetDashboard';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface AssetDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinId: string;
  coinName?: string;
  coinSymbol?: string;
}

export function AssetDashboardModal({
  isOpen,
  onClose,
  coinId,
  coinName,
  coinSymbol
}: AssetDashboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {coinName || coinSymbol || 'Asset'} Dashboard
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <UnifiedAssetDashboard coinId={coinId} coinName={coinName} />
      </DialogContent>
    </Dialog>
  );
}