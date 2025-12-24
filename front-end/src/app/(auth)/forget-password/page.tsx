"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api/authService"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { getErrorMessage } from "@/lib/error-helper"

export default function ForgotPasswordPage() {
    const router = useRouter(); 
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(""); 
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [step, setStep] = useState<"enterEmail" | "enterOtp">("enterEmail");
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            await authService.forgotPassword({ email });
            setStatus("success");
            setMessage("✅ Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn!");
            setStep("enterOtp");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setStatus("error");
            setMessage(getErrorMessage(err));
        } finally {
             if (step !== 'enterOtp') {
                setStatus(prev => prev === 'success' ? 'idle' : prev); 
                if (status !== 'success') setStatus('idle'); 
             }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
             setMessage("❌ Vui lòng nhập đủ 6 số OTP.");
             setStatus("error");
            return;
        }
        setStatus("loading");
        setMessage("");

        try {
            await authService.verifyResetOtp({ email, otp });
            setStatus("success");
            setMessage("✅ Xác minh OTP thành công! Đang chuyển hướng...");
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1500);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setStatus("error");
            setMessage(getErrorMessage(err));
        } finally {
            setStatus( prevStatus => prevStatus === 'success' ? 'success' : 'idle');
             if (status !== 'success') setStatus('idle');
        }
    };


    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background and Logo */}
            <img
                src="/images/auth-background.jpg"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-black/0" />
            <img
                className="absolute top-0 left-0 w-50 h-35 object-contain"
                src="/images/logo.png"
                alt="Logo"
            />

            <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
                <div className="flex justify-end mb-6">
                    <Link href="/login">
                        <Button
                            variant="outline"
                            className="rounded-full px-6 py-2 text-sm border-black text-black hover:bg-gray-100"
                        >
                            ← Đăng nhập
                        </Button>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-[#050A25] mb-4 text-center">Quên mật khẩu</h2>

                {/* Step 1: Enter Email */}
                {step === "enterEmail" && (
                    <>
                        <p className="text-gray-500 text-sm mb-6 text-center">
                            Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu.
                        </p>
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <Label htmlFor="email" className="mb-2">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={status === "loading"}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-full bg-[#2D55FB] hover:bg-[#1b3de0] text-white font-medium py-2"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Đang gửi..." : "Gửi mã OTP"}
                            </Button>
                        </form>
                    </>
                )}

                {/* Step 2: Enter OTP */}
                {step === "enterOtp" && (
                    <>
                        <p className="text-gray-500 text-sm mb-6 text-center">
                            Nhập mã OTP gồm 6 chữ số đã được gửi đến <span className="font-semibold">{email}</span>.
                        </p>
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <Label htmlFor="otp" className="mb-2 block text-center">Mã OTP</Label>
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={setOtp}
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Đang xác minh..." : "Xác minh OTP"}
                            </Button>
                             <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-full"
                                onClick={() => {
                                    setStep('enterEmail');
                                    setMessage('');
                                    setStatus('idle');
                                    setOtp(''); 
                                }}
                                disabled={status === "loading"}
                            >
                                Quay lại nhập Email
                            </Button>
                        </form>
                    </>
                )}

                {/* Message display */}
                {message && (
                    <p className={`text-center text-sm mt-4 ${
                        message.startsWith('✅') ? "text-green-600" : "text-red-600"
                    }`}>
                        {message}
                    </p>
                )}

                {/* Link quay lại đăng nhập (luôn hiển thị) */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Quay lại{" "}
                    <Link href="/login" className="text-[#2D55FB] hover:underline font-medium">
                        trang đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}