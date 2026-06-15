"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSchedule } from "@/app/actions/schedule";

interface Props {
  scheduleId: string;
  classId: string;
}

export function DeleteScheduleButton({ scheduleId, classId }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus jadwal ini?")) return;
    
    setIsLoading(true);
    await deleteSchedule(scheduleId, classId);
    setIsLoading(false);
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleDelete}
      disabled={isLoading}
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100 rounded-md transition-colors bg-white/50"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  );
}
