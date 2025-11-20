'use client';

import React, { useState } from 'react';
import { mockUserTickets } from '@/lib/mockData';
import { TicketCard } from '@/components/ticket/TicketCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketX } from 'lucide-react';

export default function MyTicketsPage() {
  const upcomingTickets = mockUserTickets.filter(t => t.status === 'upcoming');
  const historyTickets = mockUserTickets.filter(t => t.status === 'completed' || t.status === 'cancelled');

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Vé của tôi</h1>
      <p className="text-zinc-400 mb-8">Quản lý vé xem phim đã đặt và lịch sử giao dịch.</p>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-6">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Vé sắp chiếu ({upcomingTickets.length})
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Lịch sử đặt vé
          </TabsTrigger>
        </TabsList>

        {/* Tab Vé sắp chiếu */}
        <TabsContent value="upcoming" className="space-y-6 animate-in fade-in-50 duration-300">
          {upcomingTickets.length > 0 ? (
            upcomingTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <TicketX className="w-12 h-12 mb-4 opacity-50" />
              <p>Bạn không có vé nào sắp chiếu.</p>
            </div>
          )}
        </TabsContent>

        {/* Tab Lịch sử */}
        <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-300">
          {historyTickets.length > 0 ? (
            historyTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <TicketX className="w-12 h-12 mb-4 opacity-50" />
              <p>Lịch sử đặt vé trống.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}