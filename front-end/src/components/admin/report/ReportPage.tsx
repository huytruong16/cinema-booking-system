"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, DollarSign, Ticket, ShoppingCart, Users, ArrowDown, ArrowUp, FileDown, AreaChart, PieChartIcon, LineChartIcon, UserCheck, MonitorPlay } from 'lucide-react';
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
import { statisticsService } from '@/services/statistics.service';
import { RoomStatus, StatisticsSummary, RevenueChartData, TopMovie, TopStaff } from '@/types/statistics';
import { useAuth } from "@/contexts/AuthContext";

type ReportType = 'revenue' | 'movies' | 'staff' | 'room_status';

const reportTypeOptions: { value: ReportType; label: string; icon: React.ElementType }[] = [
    { value: 'revenue', label: 'Báo cáo Doanh thu', icon: AreaChart },
    { value: 'movies', label: 'Báo cáo Phim (Top ăn khách)', icon: PieChartIcon },
    { value: 'staff', label: 'Báo cáo Hiệu suất Nhân viên', icon: UserCheck },
    { value: 'room_status', label: 'Trạng thái phòng chiếu', icon: MonitorPlay },
];

export default function ReportPage() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('revenue');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [activePreset, setActivePreset] = useState<string>("month");

  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
  const [topStaff, setTopStaff] = useState<TopStaff[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!hasPermission("BCTHONGKE")) return;
      if (!dateRange?.from || !dateRange?.to) return;

      setLoading(true);
      try {
        let range: 'day' | 'week' | 'month' | 'year' | 'all' = 'month';
        if (activePreset === 'today') range = 'day';
        else if (activePreset === 'week') range = 'week';
        else if (activePreset === 'month') range = 'month';
        else if (activePreset === 'year') range = 'year';

        // Always fetch summary
        try {
            const summaryData = await statisticsService.getSummary({ range });
            setSummary(summaryData);
        } catch (err) {
            console.error("Failed to fetch summary:", err);
        }

        try {
            if (selectedReportType === 'revenue') {
              const revenueRange = (range === 'day') ? 'week' : range;
              const data = await statisticsService.getRevenueChart({ range: revenueRange });
              setRevenueData(data);
            } else if (selectedReportType === 'movies') {
              const data = await statisticsService.getTopMovies({ range });
              setTopMovies(data);
            } else if (selectedReportType === 'staff') {
              const data = await statisticsService.getTopStaff({ range });
              setTopStaff(data);
            } else if (selectedReportType === 'room_status') {
              const data = await statisticsService.getRoomStatus();
              setRoomStatus(data);
            }
        } catch (err) {
            console.error(`Failed to fetch ${selectedReportType} report:`, err);
        }
      } catch (error: any) {
        console.error("Failed to fetch statistics:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedReportType, activePreset]);

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

  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from) return "Chọn khoảng thời gian";
    if (dateRange.to) {
        return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`;
    }
    return format(dateRange.from, "dd/MM/yyyy");
  }, [dateRange]);

  const handleExport = (type: 'excel' | 'pdf') => {
      alert(`Đang xuất file ${type} cho báo cáo: ${reportTypeOptions.find(r => r.value === selectedReportType)?.label}
Từ: ${format(dateRange?.from || new Date(), "dd/MM/yyyy")}
Đến: ${format(dateRange?.to || new Date(), "dd/MM/yyyy")}`);
  };

  const renderReportContent = () => {
      if (loading) {
          return <div className="flex items-center justify-center h-64 text-slate-400">Đang tải dữ liệu...</div>;
      }

      switch (selectedReportType) {
          case 'revenue':
              return <RevenueReport data={revenueData} summary={summary} />;
          case 'movies':
              return <MovieReport data={topMovies} />;
          case 'staff':
              return <StaffReport data={topStaff} />;
          case 'room_status':
              return <RoomStatusReport data={roomStatus} />;
          default:
              return (
                  <div className="flex items-center justify-center h-64">
                      <p className="text-slate-500">Vui lòng chọn loại báo cáo để xem.</p>
                  </div>
              );
      }
  };

  if (!hasPermission("BCTHONGKE")) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        Bạn không có quyền xem báo cáo này.
      </div>
    );
  }

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

// Helper to safely format date
const formatDateSafe = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return format(date, 'dd/MM/yyyy');
    } catch {
        return dateStr;
    }
};

// 1. Báo cáo Doanh thu
function RevenueReport({ data, summary }: { data: RevenueChartData[], summary: StatisticsSummary | null }) {
    // Sanitize data to ensure revenue is a number
    const safeData = data.map(item => ({
        ...item,
        revenue: item.revenue || 0
    }));

    const chartConfig = {
        revenue: { label: "Doanh thu", color: "var(--chart-2)" },
    };

    return (
        <div className="space-y-6">
            {/* Biểu đồ */}
            <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={safeData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#888888" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatDateSafe(value).substring(0, 5)} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
                        <ChartTooltip cursor={true} content={<ChartTooltipContent className="bg-[#0A0A0A] border-slate-800" indicator="dot" formatter={(value) => Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
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
                            <TableHead className="text-slate-100 text-right">Doanh thu</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {safeData.map((day, index) => (
                                <TableRow key={day.date || index} className="border-slate-800 font-medium">
                                    <TableCell>{formatDateSafe(day.date)}</TableCell>
                                    <TableCell className="text-right text-primary">{day.revenue.toLocaleString('vi-VN')} ₫</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {summary && (
                    <CardFooter className="!pt-4 border-t border-slate-700 font-bold text-lg text-primary justify-between">
                        <div className="text-sm text-slate-400 font-normal">
                            Tổng vé: {(summary.totalTickets || 0).toLocaleString('vi-VN')} | Tăng trưởng: {summary.growth || 0}%
                        </div>
                        <div>
                            Tổng doanh thu: {(summary.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

// 2. Báo cáo Phim
function MovieReport({ data }: { data: TopMovie[] }) {
    // Transform data for chart to handle nested properties
    const chartData = data.map(m => ({
        ...m,
        name: m.Phim?.TenHienThi || 'Unknown',
        value: m.DoanhThu
    }));

    const chartConfig = {
        revenue: { label: "Doanh thu" },
        ...Object.fromEntries(chartData.map((m, i) => [m.name, { label: m.name, color: `var(--chart-${(i % 5) + 1})` }]))
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
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
                            data={chartData} 
                            dataKey="value" 
                            nameKey="name"   
                            outerRadius={100} 
                            innerRadius={60}
                            labelLine={false} 
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={`var(--chart-${(index % 5) + 1})`} 
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
                        {data.map((movie, index) => (
                            <TableRow key={movie.Phim?.MaPhim || index} className="border-slate-800 font-medium">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{movie.Phim?.TenHienThi || 'Unknown'}</TableCell>
                                <TableCell className="text-right text-primary">{(movie.DoanhThu || 0).toLocaleString('vi-VN')} ₫</TableCell>
                                <TableCell className="text-right">{(movie.SoVeDaBan || 0).toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </ScrollArea>
        </div>
    );
}

// 3. Báo cáo Nhân viên
function StaffReport({ data }: { data: TopStaff[] }) {
    return (
        <ScrollArea className="h-[300px]">
            <Table>
                <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-100">Hạng</TableHead>
                    <TableHead className="text-slate-100">Nhân viên</TableHead>
                    <TableHead className="text-slate-100 text-right">Doanh thu bán</TableHead>
                    <TableHead className="text-slate-100 text-right">Vé bán</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {data.map((staff, index) => (
                        <TableRow key={staff.staffId} className="border-slate-800 font-medium">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-8"><AvatarFallback>{(staff.name || '?').charAt(0)}</AvatarFallback></Avatar>
                                    <span className="font-medium">{staff.name || 'Unknown'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-primary">{(staff.totalRevenue || 0).toLocaleString('vi-VN')} ₫</TableCell>
                            <TableCell className="text-right">{(staff.totalTickets || 0).toLocaleString('vi-VN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
         </ScrollArea>
    );
}

// 4. Báo cáo Trạng thái phòng
function RoomStatusReport({ data }: { data: RoomStatus[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((room, index) => {
                const isShowing = room.TrangThai === 'DANG_CHIEU';
                const isUpcoming = room.TrangThai === 'SAP_CHIEU';
                
                const occupancyRate = (isShowing && room.GheDaDat && room.TongGhe) 
                    ? (room.GheDaDat / room.TongGhe) * 100 
                    : 0;

                return (
                    <Card key={room.PhongChieu.MaPhongChieu || index} className={cn("border-slate-800", 
                        isShowing ? "bg-green-900/10 border-green-900/50" : 
                        isUpcoming ? "bg-yellow-900/10 border-yellow-900/50" : 
                        "bg-slate-900/50"
                    )}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex justify-between items-center">
                                {room.PhongChieu.TenPhongChieu}
                                <Badge variant="outline" className={cn(
                                    isShowing ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                                    isUpcoming ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : 
                                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                    {isShowing ? 'Đang chiếu' : isUpcoming ? 'Sắp chiếu' : 'Trống'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {room.SuatChieuTiepTheo ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-semibold text-slate-200 line-clamp-1" title={room.SuatChieuTiepTheo.TenPhim}>
                                            {room.SuatChieuTiepTheo.TenPhim}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {format(new Date(room.SuatChieuTiepTheo.ThoiGianBatDau), 'HH:mm')} - {format(new Date(room.SuatChieuTiepTheo.ThoiGianKetThuc), 'HH:mm')}
                                        </p>
                                    </div>
                                    
                                    {isShowing && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Đã đặt: {room.GheDaDat}/{room.TongGhe}</span>
                                                <span>{occupancyRate.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={occupancyRate} className="h-1.5 bg-slate-800" />
                                        </div>
                                    )}

                                    {isUpcoming && (
                                        <div className="text-xs text-yellow-500 flex items-center gap-1">
                                            <span>Sẽ chiếu trong {room.SuatChieuTiepTheo.SoPhutConLai} phút nữa</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic py-2">Hiện không có suất chiếu</p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
