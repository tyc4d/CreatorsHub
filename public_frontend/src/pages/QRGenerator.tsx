import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { HiDownload } from 'react-icons/hi';
import { BiReset } from 'react-icons/bi';
import { FaEthereum } from 'react-icons/fa';
import { SiKofi, SiBuymeacoffee, SiPatreon } from 'react-icons/si';

interface Template {
  id: string;
  name: string;
  icon: JSX.Element;
  style: {
    containerClass: string;
    qrClass: string;
    textClass: string;
  };
  defaultColors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

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

const templates: Template[] = [
  {
    id: 'eth-dark',
    name: '以太坊暗色',
    icon: <FaEthereum className="w-6 h-6" />,
    style: {
      containerClass: 'bg-gray-900 p-8 rounded-2xl shadow-xl',
      qrClass: 'bg-white p-4 rounded-xl',
      textClass: 'text-white',
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#ffffff',
      background: '#000000',
    },
  },
  {
    id: 'kofi-style',
    name: 'Ko-fi 風格',
    icon: <SiKofi className="w-6 h-6" />,
    style: {
      containerClass: 'bg-blue-500 p-8 rounded-2xl shadow-xl',
      qrClass: 'bg-white p-4 rounded-xl',
      textClass: 'text-white',
    },
    defaultColors: {
      primary: '#0d6efd',
      secondary: '#ffffff',
      background: '#ffffff',
    },
  },
  {
    id: 'coffee',
    name: '買杯咖啡',
    icon: <SiBuymeacoffee className="w-6 h-6" />,
    style: {
      containerClass: 'bg-yellow-500 p-8 rounded-2xl shadow-xl',
      qrClass: 'bg-white p-4 rounded-xl',
      textClass: 'text-gray-900',
    },
    defaultColors: {
      primary: '#ffdd00',
      secondary: '#000000',
      background: '#ffffff',
    },
  },
  {
    id: 'patreon',
    name: 'Patreon 風格',
    icon: <SiPatreon className="w-6 h-6" />,
    style: {
      containerClass: 'bg-red-600 p-8 rounded-2xl shadow-xl',
      qrClass: 'bg-white p-4 rounded-xl',
      textClass: 'text-white',
    },
    defaultColors: {
      primary: '#ff424d',
      secondary: '#ffffff',
      background: '#ffffff',
    },
  },
];

export const QRGenerator = () => {
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({
    value: 'https://example.com',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'H',
    includeMargin: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [customText, setCustomText] = useState('支持我的創作');
  const [customSubtext, setCustomSubtext] = useState('掃描 QR 碼進行贊助');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    setQrStyle(prev => ({
      ...prev,
      fgColor: template.defaultColors.secondary,
      bgColor: template.defaultColors.background,
    }));
  };

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
          pngLink.download = 'donation-qr.png';
          pngLink.href = pngData;
          pngLink.click();
          break;

        case 'svg':
          const svgData = await toSvg(qrRef.current);
          const svgLink = document.createElement('a');
          svgLink.download = 'donation-qr.svg';
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
          pdf.save('donation-qr.pdf');
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
    setCustomText('支持我的創作');
    setCustomSubtext('掃描 QR 碼進行贊助');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          贊助 QR 碼生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          創建專業的贊助 QR 碼，讓支持者更容易找到您
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
          
          <div className="space-y-6">
            {/* 模板選擇 */}
            <div>
              <label className="block text-sm font-medium mb-4">
                選擇模板
              </label>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template)}
                    className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 hover:border-primary-200 dark:border-gray-700'
                    }`}
                  >
                    {template.icon}
                    <span className="font-medium">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                贊助連結
              </label>
              <input
                type="text"
                value={qrStyle.value}
                onChange={(e) => setQrStyle({ ...qrStyle, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="輸入您的贊助連結"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                主標題
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="例如：支持我的創作"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                副標題
              </label>
              <input
                type="text"
                value={customSubtext}
                onChange={(e) => setCustomSubtext(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="例如：掃描 QR 碼進行贊助"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                QR 碼大小 ({qrStyle.size}x{qrStyle.size})
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
              className={selectedTemplate.style.containerClass}
            >
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold ${selectedTemplate.style.textClass}`}>
                  {customText}
                </h3>
                <p className={`mt-2 ${selectedTemplate.style.textClass} opacity-80`}>
                  {customSubtext}
                </p>
              </div>
              <div className={selectedTemplate.style.qrClass}>
                <QRCodeSVG {...qrStyle} />
              </div>
              <div className={`mt-4 text-center ${selectedTemplate.style.textClass} text-sm opacity-60`}>
                由 CreatorsHub 提供支持
              </div>
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