'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';

interface WeeklyUploadReviewModalProps {
  weeklyUpload: WeeklyUpload;
  challenge: FirestoreChallenge;
  childName: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export default function WeeklyUploadReviewModal({
  weeklyUpload,
  challenge,
  childName,
  onApprove,
  onReject,
  onClose
}: WeeklyUploadReviewModalProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Calculate actual earnings based on screen time
  const calculateEarnings = () => {
    if (!weeklyUpload.processedData) return 0;
    
    const goalMinutes = (challenge.dailyScreenTimeGoal || 0) * 60 * (challenge.challengeDays || 6);
    const actualMinutes = weeklyUpload.processedData.screenTimeMinutes || 0;
    const metGoal = actualMinutes <= goalMinutes;
    
    const earnings = metGoal 
      ? challenge.selectedBudget 
      : Math.max(0, challenge.selectedBudget * (1 - (actualMinutes - goalMinutes) / goalMinutes));
    
    return Math.round(earnings * 10) / 10;
  };

  const actualEarnings = calculateEarnings();
  const childEstimate = weeklyUpload.childEstimate;
  const processedData = weeklyUpload.processedData;

  // Format time from minutes (rounded to whole minutes)
  const formatTime = (minutes: number) => {
    const totalMins = Math.round(minutes);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours > 0) {
      return `${hours} שעות ${mins > 0 ? `ו-${mins} דקות` : ''}`;
    }
    return `${mins} דקות`;
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(rejectReason);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-varela font-semibold text-xl text-[#262135]">
            סיכום שבועי - שבוע {challenge.weekNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        {/* Screenshot Preview */}
        {weeklyUpload.screenshotUrl && (
          <div className="mb-6">
            <p className="font-varela text-sm text-[#948DA9] mb-2">צילום מסך שהועלה:</p>
            <div 
              className={`relative cursor-pointer transition-all ${imageZoomed ? 'fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center p-4' : ''}`}
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              <img
                src={weeklyUpload.screenshotUrl}
                alt="Screenshot"
                className={`rounded-[12px] border border-gray-200 ${imageZoomed ? 'max-w-full max-h-full object-contain' : 'w-full max-h-48 object-cover'}`}
              />
              {!imageZoomed && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  לחץ להגדלה
                </div>
              )}
            </div>
          </div>
        )}

        {/* Child's Estimate */}
        {childEstimate && (
          <div className="bg-[#BBE9FD] bg-opacity-30 rounded-[12px] p-4 mb-4">
            <h3 className="font-varela font-semibold text-base text-[#273143] mb-2">
              ההערכה של {childName}:
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{childEstimate.metGoal ? '👍' : '👎'}</span>
                <span className="font-varela text-sm text-[#282743]">
                  {childEstimate.metGoal ? 'חשב שעמד ביעד' : 'חשב שלא עמד ביעד'}
                </span>
              </div>
              <div className="font-varela font-bold text-lg text-[#273143]">
                ₪{childEstimate.estimatedEarnings}
              </div>
            </div>
          </div>
        )}

        {/* Actual Results */}
        {processedData && (
          <div className="bg-[#E6F19A] bg-opacity-30 rounded-[12px] p-4 mb-4">
            <h3 className="font-varela font-semibold text-base text-[#273143] mb-2">
              תוצאות בפועל:
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-varela text-sm text-[#282743]">זמן מסך:</span>
                <span className="font-varela font-semibold text-[#273143]">
                  {formatTime(processedData.screenTimeMinutes)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-varela text-sm text-[#282743]">יעד שבועי:</span>
                <span className="font-varela font-semibold text-[#273143]">
                  {formatTime((challenge.dailyScreenTimeGoal || 0) * 60 * (challenge.challengeDays || 6))}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#273143] border-opacity-20 pt-2">
                <span className="font-varela font-semibold text-[#282743]">רווח בפועל:</span>
                <span className="font-varela font-bold text-xl text-[#273143]">
                  ₪{actualEarnings}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        {childEstimate && processedData && (
          <div className="bg-white rounded-[12px] p-4 mb-6 border-2 border-[#273143] border-opacity-10">
            <h3 className="font-varela font-semibold text-base text-[#273143] mb-3 text-center">
              השוואה
            </h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="font-varela text-xs text-[#948DA9] mb-1">הערכת {childName}</p>
                <p className="font-varela font-bold text-2xl text-[#282743]">₪{childEstimate.estimatedEarnings}</p>
              </div>
              <div className="text-3xl">
                {actualEarnings >= childEstimate.estimatedEarnings ? '🎉' : '💡'}
              </div>
              <div className="text-center">
                <p className="font-varela text-xs text-[#948DA9] mb-1">בפועל</p>
                <p className="font-varela font-bold text-2xl text-[#273143]">₪{actualEarnings}</p>
              </div>
            </div>
            {Math.abs(actualEarnings - childEstimate.estimatedEarnings) > 0.5 && (
              <p className="font-varela text-sm text-center text-[#282743] mt-3">
                {actualEarnings > childEstimate.estimatedEarnings 
                  ? `הפתעה! ${childName} הרוויח יותר ממה שחשב!`
                  : `${childName} היה קצת אופטימי, אבל עדיין הרוויח יפה!`
                }
              </p>
            )}
          </div>
        )}

        {/* Upload Info */}
        <div className="text-center mb-6">
          <p className="font-varela text-xs text-[#948DA9]">
            הועלה ב-{new Date(weeklyUpload.uploadedAt).toLocaleString('he-IL')}
            {' • '}
            על ידי {weeklyUpload.uploadedBy === 'parent' ? 'ההורה' : 'הילד/ה'}
          </p>
        </div>

        {/* Actions */}
        {weeklyUpload.status === 'pending' && (
          <>
            {!showRejectInput ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-6 rounded-[18px] text-base font-varela font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  דחה
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-6 rounded-[18px] text-base font-varela font-semibold bg-[#E6F19A] text-[#273143] hover:bg-opacity-80 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'מאשר...' : 'אשר'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="סיבת הדחייה..."
                  className="w-full p-3 rounded-[12px] border border-gray-300 font-varela text-sm resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-6 rounded-[18px] text-base font-varela font-semibold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectReason.trim()}
                    className="flex-1 py-3 px-6 rounded-[18px] text-base font-varela font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:bg-gray-300"
                  >
                    {isProcessing ? 'דוחה...' : 'אשר דחייה'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Status badge for approved/rejected */}
        {weeklyUpload.status === 'approved' && (
          <div className="bg-[#E6F19A] rounded-[12px] p-4 text-center">
            <span className="font-varela font-semibold text-[#273143]">✅ אושר</span>
            {weeklyUpload.approvedAt && (
              <p className="font-varela text-xs text-[#948DA9] mt-1">
                {new Date(weeklyUpload.approvedAt).toLocaleString('he-IL')}
              </p>
            )}
          </div>
        )}

        {weeklyUpload.status === 'rejected' && (
          <div className="bg-red-100 rounded-[12px] p-4 text-center">
            <span className="font-varela font-semibold text-red-600">❌ נדחה</span>
            {weeklyUpload.rejectionReason && (
              <p className="font-varela text-sm text-red-500 mt-1">
                {weeklyUpload.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
