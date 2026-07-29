"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportMenuButton({
  label,
  onExportCsv,
  onExportXlsx,
  disabled,
}: {
  label: string;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={disabled}>
            <Download className="size-4" />
            {label}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCsv}>ייצוא ל-CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportXlsx}>ייצוא ל-Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
