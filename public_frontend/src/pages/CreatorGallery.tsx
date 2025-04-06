import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiGridAlt } from 'react-icons/bi';
import { HiViewList } from 'react-icons/hi';
import { SiEthereum } from 'react-icons/si';
import { 
  BsTwitterX, 
  BsFacebook, 
  BsInstagram, 
  BsShare 
} from "react-icons/bs";

interface Creator {
  id: string;
  name: string;
  avatar: string;
  description: string;
  nfts: NFT[];
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

interface NFT {
  id: string;
  title: string;
  image: string;
  description: string;
  price: string;
}

// 模擬數據
const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Digital Artist Xiao Ming',
    avatar: 'https://i.pravatar.cc/150?img=1',
    description: 'Focused on digital art creation, specializing in pixel art style',
    nfts: [
      {
        id: 'nft1',
        title: 'Pixel Cat #1',
        image: 'https://picsum.photos/400/400?random=1',
        description: 'Unique pixel art style cat',
        price: '0.1'
      },
      {
        id: 'nft2',
        title: 'Pixel Dog #1',
        image: 'https://picsum.photos/400/400?random=2',
        description: 'Cute pixel art style dog',
        price: '0.15'
      }
    ],
    socialLinks: {
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com'
    }
  },
  // 可以添加更多創作者
];

export const CreatorGallery = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const handleShare = (platform: string, creator: Creator) => {
    const url = window.location.href;
    const text = `查看 ${creator.name} 的精彩作品集！`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/share?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  const handleDonate = (creator: Creator) => {
    // 實現贊助邏輯
    console.log('Donate to:', creator.name);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Creator Gallery</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore excellent creators' works and support your favorite artists
        </p>
      </div>

      <div className="mb-6 flex justify-end space-x-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded ${
            viewMode === 'grid'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <BiGridAlt className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded ${
            viewMode === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <HiViewList className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}
        >
          {mockCreators.map((creator) => (
            <motion.div
              key={creator.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{creator.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {creator.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {creator.nfts.map((nft) => (
                    <div
                      key={nft.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedCreator(creator)}
                    >
                      <img
                        src={nft.image}
                        alt={nft.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <p className="text-white text-center p-2">
                          {nft.title}
                          <br />
                          {nft.price} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {Object.entries(creator.socialLinks).map(([platform, url]) => (
                      <button
                        key={platform}
                        onClick={() => handleShare(platform, creator)}
                        className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        {platform === 'twitter' && <BsTwitterX className="w-5 h-5" />}
                        {platform === 'facebook' && <BsFacebook className="w-5 h-5" />}
                        {platform === 'instagram' && <BsInstagram className="w-5 h-5" />}
                      </button>
                    ))}
                    <button
                      onClick={() => handleShare('general', creator)}
                      className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      <BsShare className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDonate(creator)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <SiEthereum className="w-5 h-5" />
                    <span>贊助</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 