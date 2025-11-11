"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  showTime?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className = "w-[200px]",
  showTime = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState(
    date ? date.toTimeString().slice(0, 8) : "10:30:00"
  );

  // Update time when date prop changes
  React.useEffect(() => {
    if (date) {
      setTime(date.toTimeString().slice(0, 8));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange(undefined);
      setOpen(false);
      return;
    }

    if (showTime) {
      // Combine selected date with current time
      const [hours, minutes, seconds] = time.split(":");
      selectedDate.setHours(
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || "0")
      );
    }

    onDateChange(selectedDate);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes, seconds] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || "0")
      );
      onDateChange(newDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`${className} justify-between font-normal h-9 bg-card/50`}
        >
          {date ? date.toLocaleDateString("pl-PL") : placeholder}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        sideOffset={5}
        side="bottom"
        alignOffset={0}
        avoidCollisions={true}
      >
        <div className={showTime ? "min-h-[340px]" : "min-h-[320px]"}>
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
          />
        </div>
        {showTime && (
          <div className="p-3 border-t border-border bg-popover">
            <Input
              type="time"
              step="1"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
