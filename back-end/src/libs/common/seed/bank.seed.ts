import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const banks = [
  {
    code: 'ICB',
    name: 'Ngân hàng TMCP Công thương Việt Nam',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
  },
  {
    code: 'VCB',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
  },
  {
    code: 'BIDV',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
  },
  {
    code: 'VBA',
    name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    logo: 'https://cdn.vietqr.io/img/VBA.png',
  },
  {
    code: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
  },
  {
    code: 'MB',
    name: 'Ngân hàng TMCP Quân đội',
    logo: 'https://cdn.vietqr.io/img/MB.png',
  },
  {
    code: 'TCB',
    name: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
  },
  {
    code: 'ACB',
    name: 'Ngân hàng TMCP Á Châu',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
  },
  {
    code: 'VPB',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    logo: 'https://cdn.vietqr.io/img/VPB.png',
  },
  {
    code: 'TPB',
    name: 'Ngân hàng TMCP Tiên Phong',
    logo: 'https://cdn.vietqr.io/img/TPB.png',
  },
  {
    code: 'STB',
    name: 'Ngân hàng TMCP Sài Gòn Thương Tín',
    logo: 'https://cdn.vietqr.io/img/STB.png',
  },
  {
    code: 'HDB',
    name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/HDB.png',
  },
  {
    code: 'VCCB',
    name: 'Ngân hàng TMCP Bản Việt',
    logo: 'https://cdn.vietqr.io/img/VCCB.png',
  },
  {
    code: 'SCB',
    name: 'Ngân hàng TMCP Sài Gòn',
    logo: 'https://cdn.vietqr.io/img/SCB.png',
  },
  {
    code: 'VIB',
    name: 'Ngân hàng TMCP Quốc tế Việt Nam',
    logo: 'https://cdn.vietqr.io/img/VIB.png',
  },
  {
    code: 'SHB',
    name: 'Ngân hàng TMCP Sài Gòn - Hà Nội',
    logo: 'https://cdn.vietqr.io/img/SHB.png',
  },
  {
    code: 'EIB',
    name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
    logo: 'https://cdn.vietqr.io/img/EIB.png',
  },
  {
    code: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải Việt Nam',
    logo: 'https://cdn.vietqr.io/img/MSB.png',
  },
  {
    code: 'CAKE',
    name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank',
    logo: 'https://cdn.vietqr.io/img/CAKE.png',
  },
  {
    code: 'Ubank',
    name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank',
    logo: 'https://cdn.vietqr.io/img/UBANK.png',
  },
  {
    code: 'VTLMONEY',
    name: 'Tổng Công ty Dịch vụ số Viettel - Chi nhánh tập đoàn công nghiệp viễn thông Quân Đội',
    logo: 'https://cdn.vietqr.io/img/VIETTELMONEY.png',
  },
  {
    code: 'TIMO',
    name: 'Ngân hàng số Timo by Ban Viet Bank (Timo by Ban Viet Bank)',
    logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png',
  },
  {
    code: 'VNPTMONEY',
    name: 'VNPT Money',
    logo: 'https://cdn.vietqr.io/img/VNPTMONEY.png',
  },
  {
    code: 'SGICB',
    name: 'Ngân hàng TMCP Sài Gòn Công Thương',
    logo: 'https://cdn.vietqr.io/img/SGICB.png',
  },
  {
    code: 'BAB',
    name: 'Ngân hàng TMCP Bắc Á',
    logo: 'https://cdn.vietqr.io/img/BAB.png',
  },
  {
    code: 'momo',
    name: 'CTCP Dịch Vụ Di Động Trực Tuyến',
    logo: 'https://cdn.vietqr.io/img/momo.png',
  },
  {
    code: 'PVDB',
    name: 'Ngân hàng TMCP Đại Chúng Việt Nam Ngân hàng số',
    logo: 'https://cdn.vietqr.io/img/PVCB.png',
  },
  {
    code: 'PVCB',
    name: 'Ngân hàng TMCP Đại Chúng Việt Nam',
    logo: 'https://cdn.vietqr.io/img/PVCB.png',
  },
  {
    code: 'MBV',
    name: 'Ngân hàng TNHH MTV Việt Nam Hiện Đại',
    logo: 'https://cdn.vietqr.io/img/MBV.png',
  },
  {
    code: 'NCB',
    name: 'Ngân hàng TMCP Quốc Dân',
    logo: 'https://cdn.vietqr.io/img/NCB.png',
  },
  {
    code: 'SHBVN',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    logo: 'https://cdn.vietqr.io/img/SHBVN.png',
  },
  {
    code: 'ABB',
    name: 'Ngân hàng TMCP An Bình',
    logo: 'https://cdn.vietqr.io/img/ABB.png',
  },
  {
    code: 'VAB',
    name: 'Ngân hàng TMCP Việt Á',
    logo: 'https://cdn.vietqr.io/img/VAB.png',
  },
  {
    code: 'NAB',
    name: 'Ngân hàng TMCP Nam Á',
    logo: 'https://cdn.vietqr.io/img/NAB.png',
  },
  {
    code: 'PGB',
    name: 'Ngân hàng TMCP Thịnh vượng và Phát triển',
    logo: 'https://cdn.vietqr.io/img/PGB.png',
  },
  {
    code: 'VIETBANK',
    name: 'Ngân hàng TMCP Việt Nam Thương Tín',
    logo: 'https://cdn.vietqr.io/img/VIETBANK.png',
  },
  {
    code: 'BVB',
    name: 'Ngân hàng TMCP Bảo Việt',
    logo: 'https://cdn.vietqr.io/img/BVB.png',
  },
  {
    code: 'SEAB',
    name: 'Ngân hàng TMCP Đông Nam Á',
    logo: 'https://cdn.vietqr.io/img/SEAB.png',
  },
  {
    code: 'COOPBANK',
    name: 'Ngân hàng Hợp tác xã Việt Nam',
    logo: 'https://cdn.vietqr.io/img/COOPBANK.png',
  },
  {
    code: 'LPB',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    logo: 'https://cdn.vietqr.io/img/LPB.png',
  },
  {
    code: 'KLB',
    name: 'Ngân hàng TMCP Kiên Long',
    logo: 'https://cdn.vietqr.io/img/KLB.png',
  },
  {
    code: 'KBank',
    name: 'Ngân hàng Đại chúng TNHH Kasikornbank',
    logo: 'https://cdn.vietqr.io/img/KBANK.png',
  },
  {
    code: 'MAFC',
    name: 'Công ty Tài chính TNHH MTV Mirae Asset (Việt Nam) ',
    logo: 'https://cdn.vietqr.io/img/MAFC.png',
  },
  {
    code: 'HLBVN',
    name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam',
    logo: 'https://cdn.vietqr.io/img/HLBVN.png',
  },
  {
    code: 'KEBHANAHN',
    name: 'Ngân hàng KEB Hana – Chi nhánh Hà Nội',
    logo: 'https://cdn.vietqr.io/img/KEBHANAHN.png',
  },
  {
    code: 'KEBHANAHCM',
    name: 'Ngân hàng KEB Hana – Chi nhánh Thành phố Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/KEBHANAHCM.png',
  },
  {
    code: 'IVB',
    name: 'Ngân hàng TNHH Indovina',
    logo: 'https://cdn.vietqr.io/img/IVB.png',
  },
  {
    code: 'UOB',
    name: 'Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/UOB.png',
  },
  {
    code: 'NHB HN',
    name: 'Ngân hàng Nonghyup - Chi nhánh Hà Nội',
    logo: 'https://cdn.vietqr.io/img/NHB.png',
  },
  {
    code: 'SCVN',
    name: 'Ngân hàng TNHH MTV Standard Chartered Bank Việt Nam',
    logo: 'https://cdn.vietqr.io/img/SCVN.png',
  },
  {
    code: 'PBVN',
    name: 'Ngân hàng TNHH MTV Public Việt Nam',
    logo: 'https://cdn.vietqr.io/img/PBVN.png',
  },
  {
    code: 'DBS',
    name: 'DBS Bank Ltd - Chi nhánh Thành phố Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/DBS.png',
  },
  {
    code: 'Vikki',
    name: 'Ngân hàng TNHH MTV Số Vikki',
    logo: 'https://cdn.vietqr.io/img/Vikki.png',
  },
  {
    code: 'VBSP',
    name: 'Ngân hàng Chính sách Xã hội',
    logo: 'https://cdn.vietqr.io/img/VBSP.png',
  },
  {
    code: 'GPB',
    name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu',
    logo: 'https://cdn.vietqr.io/img/GPB.png',
  },
  {
    code: 'KBHCM',
    name: 'Ngân hàng Kookmin - Chi nhánh Thành phố Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/KBHCM.png',
  },
  {
    code: 'KBHN',
    name: 'Ngân hàng Kookmin - Chi nhánh Hà Nội',
    logo: 'https://cdn.vietqr.io/img/KBHN.png',
  },
  {
    code: 'WVN',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    logo: 'https://cdn.vietqr.io/img/WVN.png',
  },
  {
    code: 'VRB',
    name: 'Ngân hàng Liên doanh Việt - Nga',
    logo: 'https://cdn.vietqr.io/img/VRB.png',
  },
  {
    code: 'HSBC',
    name: 'Ngân hàng TNHH MTV HSBC (Việt Nam)',
    logo: 'https://cdn.vietqr.io/img/HSBC.png',
  },
  {
    code: 'IBKHN',
    name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh Hà Nội',
    logo: 'https://cdn.vietqr.io/img/IBK.png',
  },
  {
    code: 'IBKHCM',
    name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh',
    logo: 'https://cdn.vietqr.io/img/IBK.png',
  },
  {
    code: 'IVB',
    name: 'Ngân hàng TNHH Indovina',
    logo: 'https://cdn.vietqr.io/img/IVB.png',
  },
];

async function seed() {
  try {
    for (const b of banks) {
      await prisma.nGANHANG.upsert({
        where: { Code: b.code },
        update: {
          TenNganHang: b.name,
          Logo: b.logo,
        },
        create: {
          TenNganHang: b.name,
          Code: b.code,
          Logo: b.logo,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void seed();
}

export default seed;
