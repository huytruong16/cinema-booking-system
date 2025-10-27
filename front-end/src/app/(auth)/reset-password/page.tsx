"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authService } from "@/lib/api/authService"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get("email")

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" })
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        // Bỏ kiểm tra otpVerified
        if (!email) {
            setMessage("❌ Thiếu thông tin email.")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            setMessage("❌ Mật khẩu không khớp!")
            return
        }

        setLoading(true);
        setMessage("");
        try {
            await authService.resetPassword({ email, matkhauMoi: formData.password })
            setMessage("✅ Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...")
            setTimeout(() => router.push("/login"), 2000)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setMessage(err.message || "❌ Có lỗi xảy ra khi đặt lại mật khẩu.")
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* ... Background and Logo ... */}
            <img src="/images/auth-background.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover blur-sm scale-105" />
            <div className="absolute inset-0 bg-black/0" />
            <img className="absolute top-0 left-0 w-50 h-35 object-contain" src="/images/logo.png" alt="Learniverse Logo" />


            <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
                <div className="flex justify-end mb-6">
                    <Link href="/login">
                        <Button variant="outline" className="rounded-full px-6 py-2 text-sm border-black text-black hover:bg-gray-100">
                            ← Đăng nhập
                        </Button>
                    </Link>
                </div>

                {!email && (
                    <p className="text-red-600 text-center font-medium">❌ Thiếu thông tin email để đặt lại mật khẩu.</p>
                )}


                {email && (
                    <>
                        <h2 className="text-2xl font-bold text-[#050A25] mb-5 text-center">Đặt lại mật khẩu</h2>
                         <p className="text-center text-gray-600 mb-6">
                           Nhập mật khẩu mới cho tài khoản:{" "}
                           <span className="font-semibold text-[#2D55FB]">{email}</span>
                        </p>
                        <form onSubmit={handleSubmitPassword} className="space-y-6">
                            <div className="relative">
                                <Label htmlFor="password" className="mb-2 block">Mật khẩu mới</Label>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-8 text-gray-500">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Label htmlFor="confirmPassword" className="mb-2 block">Xác nhận mật khẩu</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-8 text-gray-500">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button type="submit" className="w-full rounded-full bg-[#2D55FB] hover:bg-[#1b3de0] text-white font-medium py-2" disabled={loading}>
                                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                            </Button>
                        </form>
                    </>
                )}

                {message && (
                    <p className={`text-center text-sm mt-4 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
                )}
            </div>
        </div>
    )
}