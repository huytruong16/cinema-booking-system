/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  Calendar as CalendarIcon,
  Film,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { statisticsService } from "@/services/statistics.service";
import { StatisticsSummary } from "@/types/statistics";
import {
  RevenueChartData,
  TopMovie,
  TopStaff,
  RoomStatus,
} from "@/types/dashboard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

type ViewMode = "day" | "week" | "month" | "year";

export default function AdminDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
  const [topStaff, setTopStaff] = useState<TopStaff[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus[]>([]);

  const fetchDashboardData = async () => {
    if (!date) return;

    setLoading(true);
    try {
      const dateStr = date.toISOString();
      const movieParams = {
        range:
          viewMode === "day"
            ? "day"
            : viewMode === "year"
            ? "year"
            : viewMode === "month"
            ? "month"
            : "week",
      } as const;

      const staffParams = {
        range: viewMode,
        date: dateStr,
      };

      const chartRange = viewMode === "day" ? "week" : viewMode;

      const [summaryRes, chartRes, moviesRes, staffRes, roomsRes] =
        await Promise.all([
          statisticsService.getSummary({ range: viewMode, date: dateStr }),
          statisticsService.getRevenueChart({
            range: chartRange,
            date: dateStr,
          }),
          statisticsService.getTopMovies(movieParams),
          statisticsService.getTopStaff(staffParams),
          statisticsService.getRoomStatus(),
        ]);

      setSummary(summaryRes);
      setRevenueChart(chartRes);


      const mappedMovies: TopMovie[] = Array.isArray(moviesRes)
        ? moviesRes.map((item: any) => ({
            id: item.Phim?.MaPhim || Math.random(),
            name:
              item.Phim?.TenHienThi ||
              item.Phim?.TenPhim ||
              item.Phim?.TenGoc ||
              "Unknown",
            image: item.Phim?.PosterUrl || item.Phim?.AnhBia || "",
            revenue: Number(item.DoanhThu || 0),
            ticketCount: Number(item.SoVeDaBan || 0),
            rating: 5,
          }))
        : [];
      setTopMovies(mappedMovies);

      const mappedStaff: TopStaff[] = Array.isArray(staffRes)
        ? staffRes.map((item: any) => ({
            id: item.NhanVien?.MaNhanVien || Math.random(),
            name: item.NhanVien?.NguoiDungPhanMem?.HoTen || "Nhân viên",
            avatar: item.NhanVien?.NguoiDungPhanMem?.AvatarUrl || "",
            revenue: Number(item.DoanhThu || 0),
            ticketCount: Number(item.SoLuotGiaoDich || 0),
            rank: "Standard",
          }))
        : [];
      setTopStaff(mappedStaff);

      const mappedRooms: RoomStatus[] = Array.isArray(roomsRes)
        ? roomsRes.map((item: any) => {
            let status: any = "active";
            if (item.TrangThai === "DANGCHIEU") status = "screening";
            else if (item.TrangThai === "BAOTRI") status = "maintenance";
            else if (item.TrangThai === "TRONG") status = "active";

            return {
              id: item.PhongChieu?.MaPhongChieu || Math.random(),
              name: item.PhongChieu?.TenPhongChieu || "Phòng",
              status: status,
              currentMovie: item.SuatChieuHienTai?.TenPhim || "",
              currentShowtime: item.SuatChieuHienTai
                ? `${format(
                    new Date(item.SuatChieuHienTai.ThoiGianBatDau),
                    "HH:mm"
                  )} - ${format(
                    new Date(item.SuatChieuHienTai.ThoiGianKetThuc),
                    "HH:mm"
                  )}`
                : "",
              totalSeats: item.TongGhe || 0,
              bookedSeats: item.GheDaDat || 0,
            };
          })
        : [];
      setRoomStatus(mappedRooms);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [date, viewMode]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select
            value={viewMode}
            onValueChange={(val: ViewMode) => setViewMode(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chế độ xem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo Ngày</SelectItem>
              <SelectItem value="week">Theo Tuần</SelectItem>
              <SelectItem value="month">Theo Tháng</SelectItem>
              <SelectItem value="year">Theo Năm</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: vi })
                ) : (
                  <span>Chọn ngày thống kê</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={fetchDashboardData} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="space-y-4">
        {/* 1. SUMMARY CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Tổng Doanh Thu"
            value={summary ? formatCurrency(summary.totalRevenue || 0) : "..."}
            icon={DollarSign}
            subText={viewMode === "day" ? "Hôm nay" : `Trong ${viewMode} này`}
          />
          <StatsCard
            title="Vé Đã Bán"
            value={summary ? `${summary.totalTickets || 0}` : "..."}
            icon={CreditCard}
            subText={viewMode === "day" ? "Hôm nay" : `Trong ${viewMode} này`}
          />
          <StatsCard
            title="Doanh Thu Combo"
            value={summary ? formatCurrency(summary.comboRevenue || 0) : "..."}
            icon={Activity}
            subText="Dịch vụ ăn uống"
          />
          <StatsCard
            title="Tỉ Lệ Lấp Đầy"
            value={summary ? `${summary.occupancyRate || 0}%` : "..."}
            icon={Users}
            subText="Hiệu suất phòng chiếu"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* 2. REVENUE CHART */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
              <CardDescription>
                {viewMode === "day"
                  ? "Hiển thị dữ liệu tuần này (Doanh thu ngày)"
                  : `Thống kê doanh thu theo ${viewMode}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Đang tải biểu đồ...
                  </div>
                ) : revenueChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChart}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                           // Format date if needed, e.g. "28/12"
                           // Assuming value is ISO string or similar, might need formatting
                           // But let's stick to simple key change first.
                           // The service returns "Ngay" from backend which is likely a string.
                           return value;
                        }}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                          return value;
                        }}
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#333"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderColor: "#374151",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="ticketRevenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Doanh thu Vé"
                      />
                      <Area
                        type="monotone"
                        dataKey="comboRevenue"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="#82ca9d"
                        name="Doanh thu Combo"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. TOP MOVIES */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Phim Bán Chạy</CardTitle>
              <CardDescription>
                Phim có doanh thu cao nhất ({viewMode}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topMovies.map((movie) => (
                  <div key={movie.id} className="flex items-center">
                    <div className="relative h-12 w-8 overflow-hidden rounded bg-slate-800 shrink-0">
                      <img
                        src={
                          movie.image ||
                          "https://placehold.co/400x600?text=No+Image"
                        }
                        alt={movie.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p
                        className="text-sm font-medium leading-none truncate"
                        title={movie.name}
                      >
                        {movie.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Film className="mr-1 h-3 w-3" /> {movie.ticketCount} vé
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-green-500 text-sm whitespace-nowrap">
                      {formatCurrency(movie.revenue)}
                    </div>
                  </div>
                ))}
                {topMovies.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. ROOM STATUS & TOP STAFF */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Nhân Viên Xuất Sắc</CardTitle>
              <CardDescription>
                Hiệu suất bán vé theo {viewMode}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={staff.avatar} alt={staff.name} />
                      <AvatarFallback>{staff.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {staff.name}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="mr-2 text-[10px] h-4 px-1"
                        >
                          {staff.rank || "N/A"}
                        </Badge>
                        {staff.ticketCount} giao dịch
                      </div>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                      {formatCurrency(staff.revenue)}
                    </div>
                  </div>
                ))}
                {topStaff.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ROOM STATUS GRID */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Trạng Thái Phòng Chiếu</CardTitle>
              <CardDescription>Cập nhật thời gian thực.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {roomStatus.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-start space-x-3 rounded-md border p-3 bg-slate-900/50"
                  >
                    <div
                      className={cn(
                        "mt-1 p-2 rounded-full shrink-0",
                        room.status === "screening"
                          ? "bg-green-500/20 text-green-500"
                          : room.status === "maintenance"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-slate-500/20 text-slate-500"
                      )}
                    >
                      <Film className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {room.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {room.status === "screening"
                          ? `Đang chiếu: ${room.currentMovie} (${room.currentShowtime})`
                          : room.status === "maintenance"
                          ? "Đang bảo trì"
                          : "Đang trống"}
                      </p>
                      {room.status === "screening" && (
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-green-500 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((room.bookedSeats || 0) /
                                  (room.totalSeats || 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {roomStatus.length === 0 && (
                  <div className="col-span-2 text-center text-sm text-muted-foreground">
                    Không có phòng nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, subText, trend }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend !== undefined && (
            <span
              className={cn(
                "mr-1 flex items-center",
                trend > 0
                  ? "text-green-500"
                  : trend < 0
                  ? "text-red-500"
                  : "text-yellow-500"
              )}
            >
              <TrendingUp
                className={cn("h-3 w-3 mr-0.5", trend < 0 && "rotate-180")}
              />
              {Math.abs(trend)}%
            </span>
          )}
          {subText}
        </p>
      </CardContent>
    </Card>
  );
}
