import React, { useState } from 'react';
import { User, Phone, Sparkles, AlertCircle, ArrowRight, PhoneCall, KeyRound } from 'lucide-react';

interface ParticipantEntryStepProps {
  initialQrCode?: string;
  onSuccess: (data: {
    participantName: string;
    phone: string;
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
  }) => void;
  onGoToDirectWheel?: () => void;
  brandName?: string;
}

export const ParticipantEntryStep: React.FC<ParticipantEntryStepProps> = ({
  initialQrCode,
  onSuccess,
  onGoToDirectWheel,
  brandName = 'Omadli Sovg‘a',
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ' + val.replace(/\D/g, '');
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhone = phone.trim();

    if (!cleanFirst) {
      setErrorMsg('Iltimos, ismingizni kiriting.');
      return;
    }
    if (!cleanLast) {
      setErrorMsg('Iltimos, familiyangizni kiriting.');
      return;
    }
    if (cleanFirst.length < 2 || cleanLast.length < 2) {
      setErrorMsg('Ism va familiya kamida 2 ta harfdan iborat bo‘lishi lozim.');
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      setErrorMsg('Iltimos, to‘liq va to‘g‘ri telefon raqamingizni kiriting (masalan: +998 90 123 45 67).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanFirst,
          lastName: cleanLast,
          phone: cleanPhone,
          qrCodeId: initialQrCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || data.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.');
        return;
      }

      // Successful registration: proceed to Step 2
      onSuccess({
        participantName: data.participantName,
        phone: data.phone || cleanPhone,
        specialCode: data.specialCode,
        assignedPrize: data.assignedPrize,
        telegramUrl: data.telegramUrl,
        operatorPhone: data.operatorPhone,
        operatorTelegram: data.operatorTelegram,
      });
    } catch (err) {
      setErrorMsg('Tarmoqda xatolik yuz berdi. Iltimos, internet aloqasini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>RASMIY YUTUQLI AKSIYA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 font-serif tracking-tight">
          {brandName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm mx-auto">
          Aksiyada qatnashish uchun ma’lumotlaringizni kiriting va o‘z maxsus kodingizni oling!
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="w-full bg-[#0C142B]/95 backdrop-blur-2xl border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* QR Indicator if scanned */}
        {initialQrCode && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <span className="font-medium">Skanerlangan Mahsulot QR-kodi:</span>
            <span className="font-mono font-bold bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-100">
              #{initialQrCode}
            </span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>

            <div className="pt-2 border-t border-red-800/60 flex items-center justify-between">
              <span className="text-[11px] text-red-300">Operator bilan bog‘lanish:</span>
              <a
                href="tel:+998937990423"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+998 93 799 04 23</span>
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Ismingiz <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full pl-10 pr-3 py-3 text-sm bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Familiyangiz <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Familiyangizni kiriting"
                className="w-full pl-10 pr-3 py-3 text-sm bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Telefon raqamingiz <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                disabled={loading}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-3 py-3 text-sm bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 font-mono transition-colors"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">
              Maxsus kod beriladi va operator tekshiruvi orqali faollashtiriladi.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.98] text-amber-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Aksiyada Qatnashish & Kod Olish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Direct link for users who already have a code */}
        {onGoToDirectWheel && (
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onGoToDirectWheel}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sizda maxsus kod bormi? Barabanni ochish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
