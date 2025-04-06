import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaEthereum, FaWallet, FaExchangeAlt, FaGlobe, FaChartLine, FaLock } from 'react-icons/fa';

export const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <FaWallet className="w-8 h-8 text-primary-500" />,
      title: "Easy Receiving",
      description: "Just connect your wallet to start receiving donations from supporters worldwide, no complex setup required."
    },
    {
      icon: <FaExchangeAlt className="w-8 h-8 text-primary-500" />,
      title: "Smart Exchange",
      description: "Utilize 1inch Fusion+ technology to automatically exchange different assets with the best path and lowest fees."
    },
    {
      icon: <FaGlobe className="w-8 h-8 text-primary-500" />,
      title: "Global Support",
      description: "Break through geographical limitations, receive donations from around the world, and expand your supporter base."
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-primary-500" />,
      title: "Transparent Tracking",
      description: "All transaction records are public and transparent, allowing supporters to track their donations and build trust."
    },
    {
      icon: <FaLock className="w-8 h-8 text-primary-500" />,
      title: "Secure & Reliable",
      description: "Based on blockchain technology, ensuring fund security without trusting third-party platforms."
    },
    {
      icon: <FaEthereum className="w-8 h-8 text-primary-500" />,
      title: "Low Fees",
      description: "Only pay network gas fees, no platform commission, maximizing your income."
    }
  ];

  const comparisons = [
    {
      feature: "Fees",
      creatorsHub: "Only network gas fees",
      others: "Platform commission 5-20% + payment processing fees"
    },
    {
      feature: "Payment Methods",
      creatorsHub: "Support multiple cryptocurrencies, automatic exchange",
      others: "Only support fiat currency or specific cryptocurrencies"
    },
    {
      feature: "Fund Settlement",
      creatorsHub: "Instant settlement, no waiting for platform processing",
      others: "Usually takes 3-7 business days"
    },
    {
      feature: "Global Support",
      creatorsHub: "No geographical restrictions, global supporters can donate directly",
      others: "Subject to geographical restrictions, some countries cannot use"
    },
    {
      feature: "Transparency",
      creatorsHub: "All transactions are public and traceable",
      others: "Fund flow is not transparent, difficult to track"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="gradient-text">CreatorsHub</span>
              <br />
              Web3 Donation Platform for Creators
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Connect your wallet and start receiving donations from supporters worldwide. No complex setup, no high fees.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link 
                to="/join" 
                className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Join as Creator
              </Link>
              <Link 
                to="/explore" 
                className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                Explore Creators
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose CreatorsHub?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide the simplest, most economical, and most global donation solution for creators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Comparison with Traditional Platforms</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              CreatorsHub offers lower fees, faster settlement, and more global support
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-primary-50 dark:bg-primary-900/30">
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">CreatorsHub</th>
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-medium">Other Platforms</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comparison, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                    <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">{comparison.feature}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{comparison.creatorsHub}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{comparison.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Just three simple steps to start receiving global donations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300">Log in to the platform with your crypto wallet, no account registration needed</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set Payment Preferences</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose the asset types you want to receive (currently supporting ETH)</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Receiving</h3>
              <p className="text-gray-600 dark:text-gray-300">Share your personal page and let supporters donate directly to you</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Ready to Start Your Web3 Donation Journey?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Join CreatorsHub, connect your wallet, and start receiving donations from supporters worldwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/join" 
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}; 