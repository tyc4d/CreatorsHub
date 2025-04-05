import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { HiDownload } from 'react-icons/hi';
import { BiReset } from 'react-icons/bi';
import { BsQrCode } from 'react-icons/bs';

interface QRCodeStyle {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export const QRGenerator = () => {
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({
    value: 'https://example.com',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'H',
    includeMargin: true,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrStyle(prev => ({
          ...prev,
          imageSettings: {
            src: e.target?.result as string,
            height: 24,
            width: 24,
            excavate: true,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!qrRef.current) return;

    try {
      switch (format) {
        case 'png':
          const pngData = await toPng(qrRef.current, { quality: 1.0 });
          const pngLink = document.createElement('a');
          pngLink.download = 'qr-code.png';
          pngLink.href = pngData;
          pngLink.click();
          break;

        case 'svg':
          const svgData = await toSvg(qrRef.current);
          const svgLink = document.createElement('a');
          svgLink.download = 'qr-code.svg';
          svgLink.href = svgData;
          svgLink.click();
          break;

        case 'pdf':
          const pdfData = await toPng(qrRef.current);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });
          const imgProps = pdf.getImageProperties(pdfData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(pdfData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('qr-code.pdf');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const resetStyle = () => {
    setQrStyle({
      value: 'https://example.com',
      size: 256,
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'H',
      includeMargin: true,
    });
    setLogoFile(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          QR 碼生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          創建獨特的 QR 碼，展現您的個人品牌風格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 控制面板 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">自定義設置</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                網址
              </label>
              <input
                type="text"
                value={qrStyle.value}
                onChange={(e) => setQrStyle({ ...qrStyle, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                大小 ({qrStyle.size}x{qrStyle.size})
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={qrStyle.size}
                onChange={(e) => setQrStyle({ ...qrStyle, size: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                前景顏色
              </label>
              <input
                type="color"
                value={qrStyle.fgColor}
                onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                className="w-full h-10 p-1 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                背景顏色
              </label>
              <input
                type="color"
                value={qrStyle.bgColor}
                onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                className="w-full h-10 p-1 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                錯誤校正等級
              </label>
              <select
                value={qrStyle.level}
                onChange={(e) => setQrStyle({ ...qrStyle, level: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="L">低 (7%)</option>
                <option value="M">中 (15%)</option>
                <option value="Q">中高 (25%)</option>
                <option value="H">高 (30%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                品牌標誌
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetStyle}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <BiReset className="w-5 h-5 mr-2" />
                重置
              </button>
            </div>
          </div>
        </motion.div>

        {/* 預覽和匯出 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">預覽與匯出</h2>
          
          <div className="flex flex-col items-center space-y-6">
            <div
              ref={qrRef}
              className="p-4 bg-white rounded-lg shadow-inner"
            >
              <QRCodeSVG {...qrStyle} />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleExport('png')}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HiDownload className="w-5 h-5 mr-2" />
                PNG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HiDownload className="w-5 h-5 mr-2" />
                SVG
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HiDownload className="w-5 h-5 mr-2" />
                PDF
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              提示：使用手機掃描器測試 QR 碼
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 