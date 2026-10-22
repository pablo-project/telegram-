import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
} from 'lucide-react';
import { PrizeIcon } from './PrizeIcon.js';

interface CodeAssignedStepProps {
  participantName: string;
  phone?: string;
  specialCode: string;
  assignedPrize: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  };
  telegramUrl: string;
  operatorPhone?: string;
  operatorTelegram?: string;
  onGoToWheel: (code: string) => void;
}

export const CodeAssignedStep: React.FC<CodeAssignedStepProps> = ({
  participantName,
  phone,
  specialCode,
  assignedPrize,
  telegramUrl,
  operatorPhone = '+998 93 799 04 23',
  operatorTelegram = 'omadli_operator',
  onGoToWheel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(specialCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const cleanOperatorTelegram = operatorTelegram.startsWith('http')
    ? operatorTelegram
    : `https://t.me/${operatorTelegram.replace('@', '')}`;

  const cleanTelegramUrl = telegramUrl.startsWith('http')
    ? telegramUrl
    : `https://t.me/${telegramUrl.replace('@', '')}`;

  return (
    <div className="w-full max-w-lg mx-auto py-4 sm:py-6 px-4 flex flex-col items-center animate-fadeIn text-center">
      {/* Golden Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase mb-3 shadow-lg shadow-amber-500/10">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>AKSIYA ISHTIROKCHISI BO‘LDINGIZ</span>
      </div>

      {/* Main Congratulation Heading Required by User */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 font-serif tracking-tight mb-2">
        Tabriklaymiz, siz 3-ishtirokchi sifatida tanlab olindingiz!
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-4">
        Sizga dam olish maskanlariga 3 kunlik yo‘llanma (vaucher) biriktirildi. Barabanni aylantiring va sovg‘angizni qabul qilib oling!
      </p>

      <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium mb-5 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800">
        <User className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold text-white">{participantName}</span>
        {phone && (
          <>
            <span className="text-slate-600">•</span>
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono">{phone}</span>
          </>
        )}
      </div>

      {/* Assigned Prize Showcase Card */}
      <div className="w-full bg-gradient-to-b from-[#0F1C3F] to-[#0A122A] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden mb-5">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#070D1F] border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-inner">
          <PrizeIcon name={assignedPrize.icon || 'ticket'} className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
        </div>

        <div className="text-xs uppercase font-bold text-amber-400/90 tracking-wider mb-1">
          🎁 Sizga biriktirilgan sovg‘a:
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white font-serif mb-2">
          {assignedPrize.name}
        </div>
        {assignedPrize.description && (
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            {assignedPrize.description}
          </p>
        )}

        {/* Special Code Box with Copy */}
        <div className="bg-[#060A17] border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-center mt-2 shadow-inner">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>SIZNING MAXSUS AKSIYA KODINGIZ:</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-300 select-all">
              {specialCode}
            </span>
            <button
              onClick={handleCopyCode}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
              }`}
              title="Kodni nusxalash"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Nusxalash</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-500/20 text-[11px] text-amber-200/90 flex flex-col gap-0.5 text-center">
            <span className="font-semibold">⚡ Barabanni faqat 1 marta aylantirishingiz mumkin!</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button to Spin Wheel */}
      <div className="w-full space-y-3 max-w-md">
        <button
          onClick={() => onGoToWheel(specialCode)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-amber-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 border border-amber-300 transition-all transform active:scale-[0.98] cursor-pointer"
        >
          <RotateCw className="w-5 h-5 text-amber-950" />
          <span>Barabanni Aylantirish</span>
          <ArrowRight className="w-5 h-5 text-amber-950" />
        </button>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>Savollar bormi? Operator:</span>
          <a
            href={`tel:${operatorPhone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{operatorPhone}</span>
          </a>
        </div>

        <a
          href={cleanTelegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Rasmiy Telegram Kanalimizga Qo‘shilish</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
