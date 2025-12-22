import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Bank {
  MaNganHang: string;
  TenNganHang: string;
  Code: string;
}

interface BankComboboxProps {
  value: string;
  onChange: (value: string) => void;
  banks: Bank[];
  isLoading?: boolean;
}

export function BankCombobox({
  value,
  onChange,
  banks,
  isLoading,
}: BankComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedBank = banks.find((bank) => bank.MaNganHang === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent border-slate-700 hover:bg-slate-800 text-slate-200 font-normal"
        >
          {value
            ? `${selectedBank?.TenNganHang} (${selectedBank?.Code})`
            : isLoading
            ? "Đang tải danh sách..."
            : "Chọn ngân hàng..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-[#1C1C1C] border-slate-700 text-slate-200"
        align="start"
      >
        <Command
          className="bg-transparent"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Tìm kiếm ngân hàng..."
            className="h-9 border-none focus:ring-0 text-slate-200 placeholder:text-slate-500"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-sm text-center text-slate-500">
              Không tìm thấy ngân hàng.
            </CommandEmpty>
            <CommandGroup>
              {banks.map((bank) => (
                <CommandItem
                  key={bank.MaNganHang}
                  value={bank.TenNganHang + " " + bank.Code} 
                  onSelect={() => {
                    onChange(bank.MaNganHang);
                    setOpen(false);
                  }}
                  className="text-slate-200 aria-selected:bg-slate-800 aria-selected:text-white cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-primary",
                        value === bank.MaNganHang ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{bank.TenNganHang}</span>
                      <span className="text-xs text-slate-500">
                        {bank.Code}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
