import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { HiDownload } from 'react-icons/hi';
import { BiReset } from 'react-icons/bi';
import { FaEthereum } from 'react-icons/fa';
import { SiKofi, SiBuymeacoffee, SiPatreon } from 'react-icons/si';
import { useAccount } from 'wagmi';
import { HiLink } from 'react-icons/hi';

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
    name: 'Ethereum Dark',
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
    name: 'Ko-fi Style',
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
    name: 'Buy Me a Coffee',
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
    name: 'Patreon Style',
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
  const { address } = useAccount();
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({
    value: 'https://example.com',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'H',
    includeMargin: true,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [customText, setCustomText] = useState('Support My Creation');
  const [customSubtext, setCustomSubtext] = useState('Scan QR Code to Donate');
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
    setCustomText('Support My Creation');
    setCustomSubtext('Scan QR Code to Donate');
  };

  // 生成 CreatorsHub 個人頁面連結
  const creatorProfileUrl = address 
    ? `http://localhost:5173/s/${address}` 
    : 'http://localhost:5173/s/connect-wallet';

  // 複製連結到剪貼板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(creatorProfileUrl);
    alert('連結已複製到剪貼板');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Donation QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create professional donation QR codes to make it easier for supporters to find you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">Custom Settings</h2>
          
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Select Template
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
                Donation Link
              </label>
              <input
                type="text"
                value={qrStyle.value}
                onChange={(e) => setQrStyle({ ...qrStyle, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your donation link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Support My Creation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={customSubtext}
                onChange={(e) => setCustomSubtext(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Scan QR Code to Donate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                QR Code Size ({qrStyle.size}x{qrStyle.size})
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
                Brand Logo
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
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Preview and Export */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">Preview & Export</h2>
          
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
                Powered by CreatorsHub
              </div>
            </div>

            {/* CreatorsHub 個人頁面連結 */}
            <div className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Your CreatorsHub Profile</h3>
              <div className="flex items-center">
                <div className="flex-grow p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 truncate">
                  {creatorProfileUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-2 bg-primary-500 text-white rounded hover:bg-primary-600"
                  title="Copy Link"
                >
                  <HiLink className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Share this link to let supporters directly access your CreatorsHub page
              </p>
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
              Tip: Test the QR code with your phone scanner
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 