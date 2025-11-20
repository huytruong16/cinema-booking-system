"use client";

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, DollarSign, Ticket, ShoppingCart, Users, ArrowDown, ArrowUp, FileDown, AreaChart, PieChartIcon, LineChartIcon, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Tooltip as RechartsTooltip
} from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ButtonGroup } from '@/components/ui/button-group';
import { Label } from '@/components/ui/label';

// --- Định nghĩa loại báo cáo ---
type ReportType = 'revenue' | 'movies' | 'staff' | 'peak_hours';

const reportTypeOptions: { value: ReportType; label: string; icon: React.ElementType }[] = [
    { value: 'revenue', label: 'Báo cáo Doanh thu', icon: AreaChart },
    { value: 'movies', label: 'Báo cáo Phim (Top ăn khách)', icon: PieChartIcon },
    { value: 'staff', label: 'Báo cáo Hiệu suất Nhân viên', icon: UserCheck },
    { value: 'peak_hours', label: 'Báo cáo Khung giờ cao điểm', icon: LineChartIcon },
];

// --- DỮ LIỆU GIẢ (MOCK DATA) ---

// Mock cho Báo cáo Doanh thu
const revenueReportData = {
  byDay: [
    { date: "10/11", tickets: 450, ticketRevenue: 35000000, combos: 200, comboRevenue: 20000000, total: 55000000 },
    { date: "11/11", tickets: 400, ticketRevenue: 30000000, combos: 180, comboRevenue: 18000000, total: 48000000 },
    { date: "12/11", tickets: 600, ticketRevenue: 50000000, combos: 220, comboRevenue: 22000000, total: 72000000 },
    { date: "13/11", tickets: 580, ticketRevenue: 48000000, combos: 200, comboRevenue: 20000000, total: 68000000 },
    { date: "14/11", tickets: 750, ticketRevenue: 65000000, combos: 300, comboRevenue: 30000000, total: 95000000 },
    { date: "15/11", tickets: 850, ticketRevenue: 75000000, combos: 350, comboRevenue: 35000000, total: 110000000 },
    { date: "16/11", tickets: 1000, ticketRevenue: 90000000, combos: 400, comboRevenue: 40000000, total: 130000000 },
  ],
  summary: {
    totalRevenue: 578000000,
    totalTickets: 4630,
    totalCombos: 1850,
  }
};
const chartConfig_Revenue = {
  ticketRevenue: { label: "Doanh thu Vé", color: "var(--chart-2)" },
  comboRevenue: { label: "Doanh thu Combo", color: "var(--chart-4)" },
};

// Mock cho Báo cáo Phim
const movieReportData = [
  { rank: 1, name: "Deadpool & Wolverine", revenue: 400000000, tickets: 4500, fill: "var(--chart-1)" },
  { rank: 2, name: "Inside Out 2", revenue: 300000000, tickets: 3800, fill: "var(--chart-2)" },
  { rank: 3, name: "Kẻ Trộm Mặt Trăng 4", revenue: 200000000, tickets: 2500, fill: "var(--chart-3)" },
  { rank: 4, name: "Phim Khác", revenue: 150000000, tickets: 1800, fill: "var(--chart-5)" },
];
const chartConfig_Movies = {
  revenue: { label: "Doanh thu" },
  ...Object.fromEntries(movieReportData.map(m => [m.name, { label: m.name, color: m.fill }]))
};

// Mock cho Báo cáo Nhân viên
const staffReportData = [
    { rank: 1, id: 2, name: "Trần Thị Bán Vé", avatar: "https://i.pravatar.cc/150?img=2", revenue: 52300000, tickets: 450, shift: "Ca Tối" },
    { rank: 2, id: 1, name: "Nguyễn Văn Admin", avatar: "https://i.pravatar.cc/150?img=1", revenue: 48100000, tickets: 410, shift: "Ca Sáng" },
    { rank: 3, id: 3, name: "Lê Văn Soát Vé", avatar: "https://i.pravatar.cc/150?img=3", revenue: 35000000, tickets: 300, shift: "Ca Tối" },
];

// Mock cho Báo cáo Khung giờ
const peakHourData = [
    { hour: "09:00", transactions: 15 }, { hour: "10:00", transactions: 20 },
    { hour: "11:00", transactions: 18 }, { hour: "12:00", transactions: 25 },
    { hour: "13:00", transactions: 30 }, { hour: "14:00", transactions: 45 },
    { hour: "15:00", transactions: 50 }, { hour: "16:00", transactions: 60 },
    { hour: "17:00", transactions: 75 }, { hour: "18:00", transactions: 90 },
    { hour: "19:00", transactions: 120 }, { hour: "20:00", transactions: 110 },
    { hour: "21:00", transactions: 80 }, { hour: "22:00", transactions: 70 },
];
// --- HẾT MOCK DATA ---


export default function ReportPage() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('revenue');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [activePreset, setActivePreset] = useState<string>("month");

  // Xử lý logic lọc nhanh
  const setPreset = (preset: string) => {
      setActivePreset(preset);
      const today = new Date();
      switch(preset) {
          case 'today': setDateRange({ from: today, to: today }); break;
          case 'week': setDateRange({ from: startOfWeek(today, { locale: vi }), to: endOfWeek(today, { locale: vi }) }); break;
          case 'month': setDateRange({ from: startOfMonth(today), to: endOfMonth(today) }); break;
          case 'year': setDateRange({ from: startOfYear(today), to: endOfYear(today) }); break;
      }
  };

  // Format chữ trên nút Date Picker
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from) return "Chọn khoảng thời gian";
    if (dateRange.to) {
        return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`;
    }
    return format(dateRange.from, "dd/MM/yyyy");
  }, [dateRange]);

  // Hàm (giả) để xử lý xuất file
  const handleExport = (type: 'excel' | 'pdf') => {
      alert(`Đang xuất file ${type} cho báo cáo: ${reportTypeOptions.find(r => r.value === selectedReportType)?.label}
Từ: ${format(dateRange?.from || new Date(), "dd/MM/yyyy")}
Đến: ${format(dateRange?.to || new Date(), "dd/MM/yyyy")}`);
  };

  // Hàm render nội dung báo cáo
  const renderReportContent = () => {
      switch (selectedReportType) {
          case 'revenue':
              return <RevenueReport data={revenueReportData} />;
          case 'movies':
              return <MovieReport data={movieReportData} />;
          case 'staff':
              return <StaffReport data={staffReportData} />;
          case 'peak_hours':
              return <PeakHourReport data={peakHourData} />;
          default:
              return (
                  <div className="flex items-center justify-center h-64">
                      <p className="text-slate-500">Vui lòng chọn loại báo cáo để xem.</p>
                  </div>
              );
      }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* 1. Header & Bộ lọc chính */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-100">Tùy chọn Báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            {/* Chọn loại báo cáo */}
            <div className="flex-1 space-y-2">
                <Label>1. Chọn loại báo cáo</Label>
                <Select value={selectedReportType} onValueChange={(v: ReportType) => setSelectedReportType(v)}>
                    <SelectTrigger className="w-full bg-transparent border-slate-700 h-11">
                        <SelectValue placeholder="Chọn loại báo cáo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                        {reportTypeOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer focus:bg-slate-700">
                                <div className="flex items-center gap-2">
                                    <opt.icon className="size-4" />
                                    <span>{opt.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Chọn thời gian */}
            <div className="flex-1 space-y-2">
                <Label>2. Chọn khoảng thời gian</Label>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white h-11")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formattedDateRange}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white" align="start">
                            <div className="flex p-2">
                                <Button variant={activePreset === 'today' ? 'default' : 'ghost'} onClick={() => setPreset('today')} className="flex-1 justify-start">Hôm nay</Button>
                                <Button variant={activePreset === 'week' ? 'default' : 'ghost'} onClick={() => setPreset('week')} className="flex-1 justify-start">Tuần này</Button>
                                <Button variant={activePreset === 'month' ? 'default' : 'ghost'} onClick={() => setPreset('month')} className="flex-1 justify-start">Tháng này</Button>
                                <Button variant={activePreset === 'year' ? 'default' : 'ghost'} onClick={() => setPreset('year')} className="flex-1 justify-start">Năm nay</Button>
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={vi}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* 2. Khu vực hiển thị Báo cáo & Nút Xuất File */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
                <CardTitle className="text-lg font-semibold text-slate-100">
                    Kết quả: {reportTypeOptions.find(r => r.value === selectedReportType)?.label}
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Dữ liệu từ {formattedDateRange}
                </CardDescription>
            </div>
            {/* Nút Xuất Báo Cáo */}
            <div className="flex gap-2">
                <Button variant="outline" className="bg-green-700/20 border-green-700 text-green-400 hover:bg-green-700/30 hover:text-green-400" onClick={() => handleExport('excel')}>
                    <FileDown className="size-4 mr-2" />
                    Xuất Excel
                </Button>
                <Button variant="outline" className="bg-red-700/20 border-red-700 text-red-400 hover:bg-red-700/30 hover:text-red-400" onClick={() => handleExport('pdf')}>
                    <FileDown className="size-4 mr-2" />
                    Xuất PDF
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {renderReportContent()}
        </CardContent>
      </Card>

    </div>
  );
}

// 1. Báo cáo Doanh thu
function RevenueReport({ data }: { data: typeof revenueReportData }) {
    return (
        <div className="space-y-6">
            {/* Biểu đồ */}
            <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig_Revenue} className="h-full w-full">
                    <BarChart data={data.byDay} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#888888" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
                        <ChartTooltip cursor={true} content={<ChartTooltipContent className="bg-[#0A0A0A] border-slate-800" indicator="dot" formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="ticketRevenue" fill="var(--color-ticketRevenue)" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="comboRevenue" fill="var(--color-comboRevenue)" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ChartContainer>
            </div>
            
            {/* Bảng chi tiết */}
            <Card className="bg-transparent border-slate-800">
                <CardHeader><CardTitle className="text-base">Chi tiết doanh thu theo ngày</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-100">Ngày</TableHead>
                            <TableHead className="text-slate-100 text-right">Tổng vé</TableHead>
                            <TableHead className="text-slate-100 text-right">Tiền vé</TableHead>
                            <TableHead className="text-slate-100 text-right">Tổng combo</TableHead>
                            <TableHead className="text-slate-100 text-right">Tiền combo</TableHead>
                            <TableHead className="text-slate-100 text-right">Tổng cộng</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {data.byDay.map((day) => (
                                <TableRow key={day.date} className="border-slate-800 font-medium">
                                    <TableCell>{day.date}</TableCell>
                                    <TableCell className="text-right">{day.tickets.toLocaleString('vi-VN')}</TableCell>
                                    <TableCell className="text-right text-blue-400">{day.ticketRevenue.toLocaleString('vi-VN')} ₫</TableCell>
                                    <TableCell className="text-right">{day.combos.toLocaleString('vi-VN')}</TableCell>
                                    <TableCell className="text-right text-orange-400">{day.comboRevenue.toLocaleString('vi-VN')} ₫</TableCell>
                                    <TableCell className="text-right text-primary">{day.total.toLocaleString('vi-VN')} ₫</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="!pt-4 border-t border-slate-700 font-bold text-lg text-primary justify-end">
                    Tổng doanh thu: {data.summary.totalRevenue.toLocaleString('vi-VN')} ₫
                </CardFooter>
            </Card>
        </div>
    );
}

// 2. Báo cáo Phim
function MovieReport({ data }: { data: typeof movieReportData }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig_Movies} className="h-full w-full">
                    <PieChart>
                        <ChartTooltip 
                            cursor={false} 
                            content={<ChartTooltipContent 
                                className="bg-[#0A0A0A] border-slate-800" 
                                indicator="dot" 
                                formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} 
                                nameKey="name" 
                            />} 
                        />
                        <Pie 
                            data={data} 
                            dataKey="revenue" 
                            nameKey="name"   
                            outerRadius={100} 
                            innerRadius={60}
                            labelLine={false} 
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.name}`} 
                                    fill={entry.fill} 
                                />
                            ))}
                        </Pie>

                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        
                    </PieChart>
                 </ChartContainer> 
            </div>
            
            <ScrollArea className="h-[300px]">
                <Table>
                    <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-slate-100">Hạng</TableHead>
                        <TableHead className="text-slate-100">Tên phim</TableHead>
                        <TableHead className="text-slate-100 text-right">Doanh thu</TableHead>
                        <TableHead className="text-slate-100 text-right">Vé bán</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {data.map((movie) => (
                            <TableRow key={movie.rank} className="border-slate-800 font-medium">
                                <TableCell>{movie.rank}</TableCell>
                                <TableCell>{movie.name}</TableCell>
                                <TableCell className="text-right text-primary">{movie.revenue.toLocaleString('vi-VN')} ₫</TableCell>
                                <TableCell className="text-right">{movie.tickets.toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </ScrollArea>
        </div>
    );
}

// 3. Báo cáo Nhân viên
function StaffReport({ data }: { data: typeof staffReportData }) {
    return (
        <ScrollArea className="h-[300px]">
            <Table>
                <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-100">Hạng</TableHead>
                    <TableHead className="text-slate-100">Nhân viên</TableHead>
                    <TableHead className="text-slate-100">Ca làm việc</TableHead>
                    <TableHead className="text-slate-100 text-right">Doanh thu bán</TableHead>
                    <TableHead className="text-slate-100 text-right">Vé bán</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {data.map((staff) => (
                        <TableRow key={staff.id} className="border-slate-800 font-medium">
                            <TableCell>{staff.rank}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-8"><AvatarImage src={staff.avatar} /><AvatarFallback>{staff.name.charAt(0)}</AvatarFallback></Avatar>
                                    <span className="font-medium">{staff.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{staff.shift}</TableCell>
                            <TableCell className="text-right text-primary">{staff.revenue.toLocaleString('vi-VN')} ₫</TableCell>
                            <TableCell className="text-right">{staff.tickets.toLocaleString('vi-VN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
         </ScrollArea>
    );
}

// 4. Báo cáo Khung giờ
function PeakHourReport({ data }: { data: typeof peakHourData }) {
    return (
        <div className="h-[300px] w-full pr-6 pb-4">
            <ChartContainer config={{ transactions: { label: "Lượt giao dịch", color: "var(--chart-1)" } }} className="h-full w-full">
                <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#888888" />
                    <XAxis dataKey="hour" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={true} content={<ChartTooltipContent className="bg-[#0A0A0A] border-slate-800" indicator="dot" />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="transactions" stroke="var(--color-transactions)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-transactions)" }} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
        </div>
    );
}

// --- COMPONENT CON: KPI CARD ---
interface KpiCardProps {
    title: string;
    value: string;
    change: number; // %
    icon: React.ReactNode;
}
function KpiCard({ title, value, change, icon }: KpiCardProps) {
    const isPositive = change >= 0;
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-100">{value}</div> 
                <p className={cn(
                    "text-xs mt-1 flex items-center gap-1",
                    isPositive ? "text-green-500" : "text-red-500"
                )}>
                    {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(change)}% so với kỳ trước
                </p>
            </CardContent>
        </Card>
    );
}