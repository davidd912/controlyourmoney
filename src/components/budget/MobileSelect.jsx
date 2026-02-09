import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function MobileSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  options, 
  label,
  id,
  ...props 
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = React.useState(false);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-right"
          id={id}
        >
          <span className={!selectedOption ? "text-muted-foreground" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent dir="rtl">
        <DrawerHeader>
          <DrawerTitle>{label || placeholder}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "outline"}
              className="w-full justify-start text-right"
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}