import React, { useState } from 'react';
import { Layout, Image as ImageIcon, Video, FileText, Youtube, Instagram, TrendingUp } from 'lucide-react';
import { AppTab } from './types';
import ThumbDownloader from './components/ThumbDownloader';
import ThumbGenerator from './components/ThumbGenerator';
import ChannelAnalyzer from './components/ChannelAnalyzer';
import ScriptGenerator from './components/ScriptGenerator';
import InstagramTools from './components/InstagramTools';
import SeoTools from './components/SeoTools';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.THUMBNAIL_DOWNLOADER);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.THUMBNAIL_DOWNLOADER:
        return <ThumbDownloader />;
      case AppTab.THUMBNAIL_GENERATOR:
        return <ThumbGenerator />;
      case AppTab.CHANNEL_ANALYSIS:
        return <ChannelAnalyzer />;
      case AppTab.SCRIPT_GENERATOR:
        return <ScriptGenerator />;
      case AppTab.INSTAGRAM_TOOLS:
        return <InstagramTools />;
      case AppTab.SEO_TOOLS:
        return <SeoTools />;
      default:
        return <ThumbDownloader />;
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-300 ${
        activeTab === tab
          ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 scale-105'
          : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
      }`}
    >
      <Icon size={20} className="mb-1 sm:mb-2" />
      <span className="text-[10px] sm:text-xs font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24 sm:pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg">
              <Youtube size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">YouTube <span className="text-red-500">Secrets AI</span></h1>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            v1.3 • Gemini 2.5 Flash & Pro
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {renderContent()}
      </main>

      {/* Navigation (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-[#0f0f0f]/90 backdrop-blur border-t border-gray-800 z-50">
        <nav className="max-w-4xl mx-auto grid grid-cols-6 gap-1 sm:gap-2">
          <NavItem tab={AppTab.THUMBNAIL_DOWNLOADER} icon={Layout} label="Baixar" />
          <NavItem tab={AppTab.THUMBNAIL_GENERATOR} icon={ImageIcon} label="Criar" />
          <NavItem tab={AppTab.CHANNEL_ANALYSIS} icon={Video} label="Auditoria" />
          <NavItem tab={AppTab.SCRIPT_GENERATOR} icon={FileText} label="Roteiros" />
          <NavItem tab={AppTab.INSTAGRAM_TOOLS} icon={Instagram} label="Insta AI" />
          <NavItem tab={AppTab.SEO_TOOLS} icon={TrendingUp} label="SEO Master" />
        </nav>
      </div>
    </div>
  );
};

export default App;
