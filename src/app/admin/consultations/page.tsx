'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId } from '@/utils/auth';
import { isAdmin } from '@/utils/admin';
import { getAllPendingChallenges, updateChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { getChild } from '@/lib/api/children';
import type { FirestoreChallenge } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('AdminConsultations');

interface ChallengeWithDetails extends FirestoreChallenge {
  parentName?: string;
  childName?: string;
}

export default function AdminConsultationsPage() {
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<FirestoreChallenge | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const isUserAdmin = await isAdmin();
        logger.log('Admin check result:', isUserAdmin);
        if (!isUserAdmin) {
          logger.warn('User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        logger.log('User is admin, loading challenges');
        await loadChallenges();
      } catch (err) {
        logger.error('Error checking admin status:', err);
        setLoading(false);
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  const loadChallenges = async () => {
    try {
      setError(null);

      // Get all pending challenges (for all users, not just admin's)
      const pendingChallenges = await getAllPendingChallenges();
      
      // Load parent and child details for each challenge
      const challengesWithDetails: ChallengeWithDetails[] = await Promise.all(
        pendingChallenges.map(async (challenge) => {
          let parentName = 'לא ידוע';
          let childName = 'לא ידוע';
          
          try {
            const parent = await getUser(challenge.parentId);
            if (parent) {
              parentName = parent.firstName || parent.username || 'לא ידוע';
            }
            
            const child = await getChild(challenge.childId);
            if (child) {
              childName = child.name || 'לא ידוע';
            }
          } catch (err) {
            logger.error(`Error loading details for challenge ${challenge.id}:`, err);
          }
          
          return {
            ...challenge,
            parentName,
            childName
          };
        })
      );
      
      setChallenges(challengesWithDetails);
      logger.log(`Loaded ${challengesWithDetails.length} pending challenges`);
    } catch (err: any) {
      logger.error('Error loading challenges:', err);
      setError(err.message || 'שגיאה בטעינת האתגרים');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedChallenge || !startDate) {
      alert('אנא בחר תאריך התחלה');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Update challenge: set consultationCompleted to true, set startDate, and activate
      await updateChallenge(selectedChallenge.id, {
        consultationCompleted: true,
        startDate: new Date(startDate).toISOString().split('T')[0],
        isActive: true,
      });

      alert('השיחה אושרה והאתגר הופעל בהצלחה!');
      setSelectedChallenge(null);
      setStartDate('');
      loadChallenges();
    } catch (err: any) {
      logger.error('Error approving consultation:', err);
      alert('שגיאה באישור השיחה: ' + (err.message || 'שגיאה לא ידועה'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="font-varela text-lg text-[#262135] mb-4">טוען...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-varela font-semibold text-3xl text-[#262135] mb-6 text-center">
          אישור שיחות עם יועצי קשב
        </h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-[18px] p-4 mb-6">
            <p className="font-varela text-base text-red-800">{error}</p>
          </div>
        )}

        {challenges.length === 0 ? (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <p className="font-varela text-base text-[#282743]">
              אין אתגרים הממתינים לאישור
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-varela font-semibold text-lg text-[#262135] mb-2">
                      אתגר #{challenge.id.slice(0, 8)}
                    </h3>
                    <p className="font-varela text-sm text-[#282743] mb-1">
                      הורה: {challenge.parentName || 'לא ידוע'}
                    </p>
                    <p className="font-varela text-sm text-[#282743] mb-1">
                      ילד: {challenge.childName || 'לא ידוע'}
                    </p>
                    <p className="font-varela text-sm text-[#282743]">
                      נוצר ב: {new Date(challenge.createdAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      // Set default start date to tomorrow
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setStartDate(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="bg-[#273143] text-white px-4 py-2 rounded-[12px] font-varela font-semibold text-sm hover:bg-opacity-90 transition-all"
                  >
                    אישור שיחה
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] max-w-md w-full p-6">
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4">
                אישור שיחה וקביעת תאריך התחלה
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-varela font-semibold text-sm text-[#273143] block mb-2">
                    תאריך התחלת אתגר
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-[12px] font-varela text-sm text-[#273143] focus:outline-none focus:border-[#273143]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedChallenge(null);
                    setStartDate('');
                  }}
                  className="flex-1 py-3 px-4 rounded-[12px] bg-gray-200 text-[#273143] font-varela font-semibold hover:bg-gray-300 transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting || !startDate}
                  className={`flex-1 py-3 px-4 rounded-[12px] font-varela font-semibold transition-all ${
                    isSubmitting || !startDate
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#273143] text-white hover:bg-opacity-90'
                  }`}
                >
                  {isSubmitting ? 'מאשר...' : 'אשר וקבע תאריך'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
