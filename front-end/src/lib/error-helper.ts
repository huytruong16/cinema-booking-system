// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any): string => {
  if (!error) return "Đã xảy ra lỗi không xác định.";

  const backendMessage = error.response?.data?.message || error.response?.data?.error;

  if (backendMessage) {
    if (backendMessage === "Bad credentials") return "Email hoặc mật khẩu không đúng.";
    if (backendMessage === "User not found") return "Người dùng không tồn tại.";
    if (backendMessage === "Email already exists") return "Email đã được đăng ký.";
    if (backendMessage === "User already exists") return "Người dùng đã tồn tại.";
    if (backendMessage.includes("OTP is invalid")) return "Mã OTP không hợp lệ.";
    if (backendMessage.includes("OTP has expired")) return "Mã OTP đã hết hạn.";
    if (backendMessage.includes("Password must contain")) return "Mật khẩu phải chứa ít nhất 1 số, 1 ký tự đặc biệt và 1 chữ hoa.";
    
    if (Array.isArray(backendMessage)) {
        return backendMessage.join(", ");
    }

    return backendMessage;
  }

  if (error.response) {
      switch (error.response.status) {
          case 400:
              return "Yêu cầu không hợp lệ.";
          case 401:
              return "Email hoặc mật khẩu không đúng.";
          case 403:
              return "Bạn không có quyền thực hiện hành động này.";
          case 404:
              return "Không tìm thấy tài nguyên.";
          case 409:
              return "Dữ liệu đã tồn tại (Email hoặc thông tin khác).";
          case 500:
              return "Lỗi hệ thống. Vui lòng thử lại sau.";
          default:
              return `Lỗi: ${error.response.statusText || error.response.status}`;
      }
  }

  if (error.message) {
    if (error.message === "Network Error") return "Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền.";
    if (error.message.includes("timeout")) return "Hết thời gian chờ kết nối.";
    if (error.message === "Bad credentials") return "Email hoặc mật khẩu không đúng.";
    if (error.message.includes("Password must contain")) return "Mật khẩu phải chứa ít nhất 1 số, 1 ký tự đặc biệt và 1 chữ hoa.";
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
};
