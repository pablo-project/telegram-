import React, { useState, useEffect } from 'react';
import { FortuneWheel, WheelSegment } from './FortuneWheel.js';
import { Play, AlertCircle, KeyRound, Sparkles, CheckCircle, ArrowLeft, PhoneCall } from 'lucide-react';

interface WheelSpinStepProps {
  initialCode?: string;
  totalSegments?: number;
  onSpinSuccess: (result: {
    winningPrize: { name: string; description?: string; icon?: string; color?: string };
    ticketId: string;
    timestamp: string;
  }) => void;
  onBackToEntry?: () => void;
}

export const WheelSpinStep: React.FC<WheelSpinStepProps> = ({
  initialCode = '',
  totalSegments = 5,
  onSpinSuccess,
  onBackToEntry,
}) => {
  const [code, setCode] = useState(initialCode);
  const [verifiedInfo, setVerifiedInfo] = useState<{
    participantName: string;
    specialCode: string;
    assignedPrizeName: string;
  } | null>(null);

  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [checkingCode, setCheckingCode] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [pendingSpinResult, setPendingSpinResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [operatorPhone, setOperatorPhone] = useState<string | null>(null);
  const [operatorTelegram, setOperatorTelegram] = useState<string | null>(null);

  // Fetch wheel segments (5 prizes) on mount
  useEffect(() => {
    fetch('/api/wheel-segments')
      .then((res) => res.json())
      .then((data) => {
        if (data.segments && data.segments.length > 0) {
          setSegments(data.segments);
        }
      })
      .catch(() => {});
  }, []);

  // If initialCode was provided on load, auto-verify it
  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      verifySpecialCode(initialCode.trim());
    }
  }, [initialCode]);

  const verifySpecialCode = async (codeToTest: string) => {
    if (!codeToTest.trim()) {
      setErrorMsg('Iltimos, maxsus kodni kiriting.');
      return;
    }

    setCheckingCode(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToTest.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Kiritilgan maxsus kod topilmadi.');
        if (data.operatorPhone) setOperatorPhone(data.operatorPhone);
        if (data.operatorTelegram) setOperatorTelegram(data.operatorTelegram);
        setVerifiedInfo(null);
        return;
      }

      setVerifiedInfo({
        participantName: data.participantName,
        specialCode: data.specialCode,
        assignedPrizeName: data.assignedPrizeName || 'Maxsus Sovg‘a',
      });
    } catch (e) {
      setErrorMsg('Tarmoqda xatolik yuz berdi. Internetni tekshiring.');
    } finally {
      setCheckingCode(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifySpecialCode(code);
  };

  // Trigger spin on server using special code
  const handleStartSpin = async () => {
    if (isSpinning) return;
    const activeCode = verifiedInfo?.specialCode || code.trim();
    if (!activeCode) {
      setErrorMsg('Maxsus kod aniqlanmadi.');
      return;
    }

    setErrorMsg(null);

    try {
      const res = await fetch('/api/spin-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.message || 'Xatolik yuz berdi.');
        return;
      }

      // Server successfully selected the predetermined winning prize!
      setPendingSpinResult(data);
      setTargetPrizeIndex(data.prizeIndex);
      setIsSpinning(true);
    } catch (err) {
      setErrorMsg('Tarmoqda xatolik yuz berdi. Qaytadan urinib ko‘ring.');
    }
  };

  const handleAnimationEnd = () => {
    setIsSpinning(false);
    if (pendingSpinResult) {
      onSpinSuccess({
        winningPrize: pendingSpinResult.winningPrize,
        ticketId: pendingSpinResult.ticketId,
        timestamp: pendingSpinResult.timestamp,
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-2 sm:py-6 px-4">
      {/* Back button if available */}
      {onBackToEntry && !isSpinning && (
        <div className="w-full max-w-md flex justify-start mb-2">
          <button
            onClick={onBackToEntry}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>QR-kod orqali ro‘yxatdan o‘tishga qaytish</span>
          </button>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="mb-4 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs space-y-2.5 max-w-md w-full animate-shake">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMsg}</span>
          </div>
          {operatorPhone && (
            <div className="pt-2 border-t border-red-800/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-red-300">Faollashtirish uchun:</span>
              <a
                href={`tel:${operatorPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{operatorPhone}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* IF CODE NOT YET VERIFIED: Code Prompt Input */}
      {!verifiedInfo && (
        <div className="w-full max-w-md bg-[#0C142B]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white font-serif mb-1">
            Maxsus Kodingizni Kiriting
          </h2>
          <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
            QR-kod skanerlaganda yoki Telegram havolasidan berilgan maxsus kodni kiriting
          </p>

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                disabled={checkingCode}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Masalan: DLK-782910"
                className="w-full px-4 py-3.5 text-center text-lg sm:text-xl font-mono font-black tracking-widest bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-2xl text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40 uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={checkingCode || !code.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.98] text-amber-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {checkingCode ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Barabanni Faollashtirish</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* IF CODE VERIFIED: Participant Status Header */}
      {verifiedInfo && (
        <div className="w-full max-w-md mb-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#0C142B] to-[#121B38] border border-amber-400/40 shadow-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                {verifiedInfo.participantName}
              </div>
              <div className="text-[11px] text-amber-300 font-mono">
                Kod: {verifiedInfo.specialCode}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
              Tayyor
            </span>
          </div>
        </div>
      )}

      {/* Center Fortune Wheel */}
      <div className="my-2 sm:my-4">
        <FortuneWheel
          segmentsCount={segments.length > 0 ? segments.length : totalSegments}
          segments={segments}
          isSpinning={isSpinning}
          targetPrizeIndex={targetPrizeIndex}
          onSpinEnd={handleAnimationEnd}
        />
      </div>

      {/* Spin Button */}
      <div className="w-full max-w-sm mt-3 sm:mt-5 px-4">
        <button
          onClick={handleStartSpin}
          disabled={isSpinning || !verifiedInfo}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl cursor-pointer ${
            isSpinning || !verifiedInfo
              ? 'bg-amber-600/30 text-amber-300/40 cursor-not-allowed border border-amber-500/20'
              : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-amber-950 hover:brightness-110 active:scale-[0.98] shadow-amber-500/30 border border-amber-300'
          }`}
        >
          {isSpinning ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
              <span>Baraban aylanmoqda...</span>
            </>
          ) : !verifiedInfo ? (
            <>
              <KeyRound className="w-4 h-4 text-amber-400/60" />
              <span>Avval kodni kiriting</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-amber-950" />
              <span>Barabanni aylantirish</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
