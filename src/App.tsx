/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ParticipantEntryStep } from './components/ParticipantEntryStep.js';
import { CodeAssignedStep } from './components/CodeAssignedStep.js';
import { WheelSpinStep } from './components/WheelSpinStep.js';
import { WinnerCelebrationStep } from './components/WinnerCelebrationStep.js';
import { PrizeShowcase } from './components/PrizeShowcase.js';
import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { Prize } from './types/index.js';

export default function App() {
  const checkIsAdmin = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const search = window.location.search;
    return path === '/admin' || path.startsWith('/admin') || search.includes('admin=true') || search.includes('admin=1');
  };

  // Navigation Routing: Check if currently accessing '/admin' or ?admin=true
  const [isAdminPath, setIsAdminPath] = useState(checkIsAdmin());
  const [adminToken, setAdminToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('fortune_admin_token') : null
  );

  // Participant Flow Step: 'entry' | 'assigned' | 'wheel' | 'result'
  const [step, setStep] = useState<'entry' | 'assigned' | 'wheel' | 'result'>('entry');

  // Stored Assigned Code & Prize Details from Step 1
  const [assignedData, setAssignedData] = useState<{
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
  } | null>(null);

  // Active code for wheel
  const [activeWheelCode, setActiveWheelCode] = useState<string>('');

  // Wheel configuration & Segments count
  const [totalSegments, setTotalSegments] = useState<number>(7);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [brandName, setBrandName] = useState<string>('Omadli Sovg‘a');
  const [urlQrCode, setUrlQrCode] = useState<string>('');

  // Result from Server Spin
  const [spinWinnerResult, setSpinWinnerResult] = useState<{
    winningPrize: { name: string; description?: string; icon?: string; color?: string };
    ticketId: string;
    timestamp: string;
  } | null>(null);

  // Listen to popstate / path changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminPath(checkIsAdmin());
    };
    window.addEventListener('popstate', handleRouteChange);

    // Keyboard shortcut for admin: Ctrl+Shift+A or Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setIsAdminPath(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Parse URL params for product QR code or direct wheel code
    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('qr');
    if (qrParam) {
      setUrlQrCode(qrParam.trim().toUpperCase());
    }

    const codeParam = params.get('code');
    const wheelParam = params.get('wheel');
    if (codeParam) {
      setActiveWheelCode(codeParam.trim().toUpperCase());
      setStep('wheel');
    } else if (wheelParam === 'true' || wheelParam === '1') {
      setStep('wheel');
    }

    // Fetch public basic branding and wheel segment count
    fetch('/api/public/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.brandName) setBrandName(data.brandName);
      })
      .catch(() => {});

    fetch('/api/wheel-segments')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalSegments) setTotalSegments(data.totalSegments);
      })
      .catch(() => {});

    fetch('/api/prizes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrizes(data);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // -------------------------------------------------------------
  // ADMINISTRATOR SYSTEM (Completely Isolated at /admin)
  // -------------------------------------------------------------
  if (isAdminPath) {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token) => {
            setAdminToken(token);
            localStorage.setItem('fortune_admin_token', token);
          }}
        />
      );
    }

    return (
      <AdminDashboard
        token={adminToken}
        onLogout={() => {
          fetch('/api/admin/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
          }).catch(() => {});
          setAdminToken(null);
          localStorage.removeItem('fortune_admin_token');
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // PARTICIPANT PORTAL
  // 4-Step User Journey:
  // 1. Entry: Scan QR, Enter Name & Phone
  // 2. Assigned: "Tabriklaymiz siz falon sovga yutdingiz", Special Code & Telegram link
  // 3. Wheel: Special code verification & predetermined Fortune Wheel spin
  // 4. Result: Celebration & Operator Contact
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Luxury Radial Lighting Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-b from-amber-500/10 via-blue-900/15 to-transparent rounded-full blur-3xl opacity-75" />
        <div className="absolute top-[35%] -left-32 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />
        <div className="absolute top-[50%] -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Dynamic Flow Container */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-6 sm:py-8">
        {/* STEP 1: PARTICIPANT ENTRY (Name, Surname, Phone) */}
        {step === 'entry' && (
          <ParticipantEntryStep
            brandName={brandName}
            initialQrCode={urlQrCode}
            onSuccess={(data) => {
              setAssignedData(data);
              setActiveWheelCode(data.specialCode);
              setStep('assigned');
            }}
            onGoToDirectWheel={() => {
              setStep('wheel');
            }}
          />
        )}

        {/* STEP 2: CODE ASSIGNED & CONGRATULATION & TELEGRAM LINK */}
        {step === 'assigned' && assignedData && (
          <CodeAssignedStep
            participantName={assignedData.participantName}
            phone={assignedData.phone}
            specialCode={assignedData.specialCode}
            assignedPrize={assignedData.assignedPrize}
            telegramUrl={assignedData.telegramUrl}
            operatorPhone={assignedData.operatorPhone}
            operatorTelegram={assignedData.operatorTelegram}
            onGoToWheel={(code) => {
              setActiveWheelCode(code);
              setStep('wheel');
            }}
          />
        )}

        {/* STEP 3: WHEEL SPIN WITH SPECIAL CODE */}
        {step === 'wheel' && (
          <WheelSpinStep
            initialCode={activeWheelCode}
            totalSegments={totalSegments}
            onSpinSuccess={(result) => {
              setSpinWinnerResult(result);
              setStep('result');
            }}
            onBackToEntry={() => {
              setStep('entry');
            }}
          />
        )}

        {/* STEP 4: CELEBRATION RESULT */}
        {step === 'result' && spinWinnerResult && (
          <WinnerCelebrationStep
            participantName={assignedData?.participantName || 'G‘olib Ishtirokchi'}
            phone={assignedData?.phone || ''}
            prizeName={spinWinnerResult.winningPrize.name}
            prizeIcon={spinWinnerResult.winningPrize.icon}
            ticketId={spinWinnerResult.ticketId}
            timestamp={spinWinnerResult.timestamp}
            operatorPhone={assignedData?.operatorPhone}
          />
        )}
      </main>

      {/* Quiet, Clean Footer with subtle Admin access */}
      <footer className="relative z-10 py-5 text-center text-[11px] text-slate-500 border-t border-slate-800/40">
        <div className="flex items-center justify-center gap-2">
          <span>© {new Date().getFullYear()} {brandName}. Barcha huquqlar himoyalangan.</span>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/admin');
              setIsAdminPath(true);
            }}
            className="text-slate-700 hover:text-amber-400/80 p-1 rounded transition-colors cursor-pointer"
            title="Administrator Kirish"
          >
            🔒
          </button>
        </div>
      </footer>
    </div>
  );
}
