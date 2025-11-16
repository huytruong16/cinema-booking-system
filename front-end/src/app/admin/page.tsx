"use client";

import React, { useState } from "react"; // <-- 1. Import useState để dùng filter
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- 2. Import component Select
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  Ticket,
  Users,
  Film,
  Calendar,
  UserCheck,
  ShoppingBasket,
  Armchair // <-- 3. Import icon mới cho phòng chiếu
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// --- Dữ liệu (Giữ nguyên) ---
const stats = [
  {
    title: "Doanh thu hôm nay",
    value: "120.500.000 ₫",
    icon: <DollarSign className="size-6 text-green-500" />,
    change: "+12.5%",
    changeColor: "text-green-500",
    // Bỏ href
  },
  {
    title: "Vé đã bán (hôm nay)",
    value: "1.250",
    icon: <Ticket className="size-6 text-blue-500" />,
    change: "+80 vé",
    changeColor: "text-blue-500",
    // Bỏ href
  },
  {
    title: "Tỉ lệ lấp đầy (hôm nay)",
    value: "65%",
    icon: <Users className="size-6 text-yellow-500" />,
    change: "-2%",
    changeColor: "text-red-500",
    // Bỏ href
  },
  {
    title: "Doanh thu Combo (hôm nay)",
    value: "45.200.000 ₫",
    icon: <ShoppingBasket className="size-6 text-orange-500" />,
    change: "+5.1%",
    changeColor: "text-green-500",
    // Bỏ href
  },
];
const chartData = [
  { date: "T2", ve: 35000000, combo: 20000000 },
  { date: "T3", ve: 30000000, combo: 18000000 },
  { date: "T4", ve: 50000000, combo: 22000000 },
  { date: "T5", ve: 48000000, combo: 20000000 },
  { date: "T6", ve: 65000000, combo: 30000000 },
  { date: "T7", ve: 75000000, combo: 35000000 },
  { date: "CN", ve: 90000000, combo: 40000000 },
];
const topMovies = [
  { id: 1, title: "Inside Out 2", revenue: "950.000.000 ₫" },
  { id: 2, title: "Deadpool & Wolverine", revenue: "720.000.000 ₫" },
  { id: 3, title: "Despicable Me 4", revenue: "510.000.000 ₫" },
];
const upcomingShowtimes = [
    { id: 101, time: "15:30", movie: "Inside Out 2", room: "Phòng 3", status: "Còn 20/100 ghế" },
    { id: 102, time: "15:45", movie: "Deadpool & Wolverine", room: "Phòng 1 (IMAX)", status: "Gần đầy" },
    { id: 103, time: "16:00", movie: "Despicable Me 4", room: "Phòng 5", status: "Còn 65/120 ghế" },
];
const topStaff = [
    { id: 1, name: "Nguyễn Văn A", sales: "15.200.000 ₫" },
    { id: 2, name: "Trần Thị B", sales: "12.800.000 ₫" },
    { id: 3, name: "Lê Văn C", sales: "11.100.000 ₫" },
];
// --- Hết dữ liệu ---

// 4. BỔ SUNG: Dữ liệu Tình trạng phòng chiếu 
const roomStatuses = [
    { id: 1, name: "Phòng 1 (IMAX)", status: "Đang chiếu", filled: "98/120" },
    { id: 2, name: "Phòng 2 (2D)", status: "Sắp chiếu (15:45)", filled: "15/100" },
    { id: 3, name: "Phòng 3 (3D)", status: "Đang dọn dẹp", filled: "0/100" },
    { id: 4, name: "Phòng 4 (2D)", status: "Đang chiếu", filled: "110/110" },
    { id: 5, name: "Phòng 5 (3D)", status: "Trống", filled: "0/150" },
];

// 5. BỔ SUNG: Component Filter (để tái sử dụng)
function FilterSelect({ value, onValueChange, options }: { 
    value: string, 
    onValueChange: (value: string) => void,
    options: { value: string, label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px] bg-transparent border-slate-700 text-slate-300 h-8 text-xs">
        <SelectValue placeholder="Lọc" />
      </SelectTrigger>
      <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer focus:bg-slate-700">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Định nghĩa các lựa chọn filter
const filterOptions = [
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
    { value: "year", label: "Năm nay" },
];

const staffFilterOptions = [
    { value: "day", label: "Hôm nay" },
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
];

export default function DashboardPage() {
  // 6. BỔ SUNG: State cho các bộ lọc
  const [revenueFilter, setRevenueFilter] = useState("week");
  const [topMovieFilter, setTopMovieFilter] = useState("week");
  const [staffFilter, setStaffFilter] = useState("day");

  return (
    <div className="bg-transparent text-slate-100 space-y-6">
      
      {/* 4 Thẻ thống kê nhanh (ĐÃ BỎ HYPERLINK & SỬA MÀU CHỮ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#1C1C1C] border-slate-800 shadow-lg cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{s.title}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              {/* Sửa: Dùng text-slate-100 (sáng) thay vì text-primary */}
              <div className="text-3xl font-bold text-slate-100">{s.value}</div> 
              <p className={`text-xs ${s.changeColor} mt-1`}>
                {s.change} so với hôm qua
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ doanh thu (ĐÃ THÊM FILTER) */}
        <Card className="lg:col-span-2 bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold text-slate-100">
              Báo cáo doanh thu
            </CardTitle>
            {/* 7. BỔ SUNG: Thêm Filter vào Card Header */}
            <FilterSelect 
              value={revenueFilter} 
              onValueChange={setRevenueFilter} 
              options={filterOptions} 
            />
          </CardHeader>
          <CardContent className="h-[350px] w-full p-0 pr-6 pb-4">
            <ChartContainer 
              config={{
                ve: { label: "Doanh thu Vé", color: "var(--chart-2)" },
                combo: { label: "Doanh thu Combo", color: "var(--chart-4)" },
              }} 
              className="h-full w-full"
            >
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#888888" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                      className="bg-[#0A0A0A] border-slate-800"
                      indicator="dot"
                      formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    />}
                  />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ve" fill="var(--color-ve)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="combo" fill="var(--color-combo)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Phim (ĐÃ THÊM FILTER) */}
        <Card className="lg:col-span-1 bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold text-slate-100">Top Phim Ăn Khách</CardTitle>
            {/* 8. BỔ SUNG: Thêm Filter vào Card Header */}
            <FilterSelect 
              value={topMovieFilter} 
              onValueChange={setTopMovieFilter} 
              options={filterOptions} 
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <ul className="flex flex-col gap-2">
                {topMovies.map((movie) => (
                  <li key={movie.id}>
                    <Link 
                      href={`/admin/movie-management/${movie.id}`}
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-slate-800/80 transition-colors"
                    >
                      <Film className="size-6 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-slate-100">{movie.title}</p>
                        <p className="text-xs text-slate-400">{movie.revenue}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* 9. BỔ SUNG: Thay đổi layout hàng 3, thêm Card Tình trạng phòng chiếu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Suất chiếu sắp tới (Giữ nguyên) */}
        <Card className="lg:col-span-1 bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-100">Suất chiếu sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ul className="flex flex-col gap-2">
                {upcomingShowtimes.map((show) => (
                  <li key={show.id}>
                    <Link
                      href={`/admin/pos?showtimeId=${show.id}`}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/80 transition-colors"
                    >
                      <Calendar className="size-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-100">{show.time} - {show.movie}</p>
                        <p className="text-xs text-slate-400">{show.room}</p>
                      </div>
                      <span className={`text-xs font-semibold ${
                        show.status === 'Đã đầy' ? 'text-red-500' : (show.status === 'Gần đầy' ? 'text-yellow-500' : 'text-green-500')
                      }`}>
                        {show.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Nhân viên (ĐÃ THÊM FILTER) */}
        <Card className="lg:col-span-1 bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold text-slate-100">Hiệu suất nhân viên</CardTitle>
            {/* 10. BỔ SUNG: Thêm Filter vào Card Header */}
            <FilterSelect 
              value={staffFilter} 
              onValueChange={setStaffFilter} 
              options={staffFilterOptions} 
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ul className="flex flex-col gap-2">
                {topStaff.map((staff) => (
                   <li key={staff.id}>
                     <Link
                        href={`/admin/user-management/${staff.id}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/80 transition-colors"
                      >
                        <UserCheck className="size-5 text-green-400" />
                        <div className="flex-1"><p className="text-slate-100">{staff.name}</p></div>
                        <p className="text-sm font-medium text-slate-300">{staff.sales}</p>
                     </Link>
                   </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* 11. BỔ SUNG: Card Tình trạng phòng chiếu */}
        <Card className="lg:col-span-1 bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-100">Tình trạng phòng chiếu</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ul className="flex flex-col gap-2">
                {roomStatuses.map((room) => (
                   <li key={room.id}>
                     <Link
                        href={`/admin/room-management?roomId=${room.id}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/80 transition-colors"
                      >
                        <Armchair className={`size-5 ${
                            room.status === 'Đang chiếu' ? 'text-red-500' : (room.status.startsWith('Sắp chiếu') ? 'text-yellow-500' : 'text-green-500')
                        }`} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-100">{room.name}</p>
                            <p className="text-xs text-slate-400">{room.status}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-300">{room.filled}</p>
                     </Link>
                   </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}