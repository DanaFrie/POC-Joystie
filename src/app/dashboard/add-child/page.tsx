export default function AddChild() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-3xl font-bold text-center mb-8">הוספת ילד/ה חדש/ה</h1>

        <form className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">פרטים בסיסיים</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל</label>
              <input
                type="number"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
              />
            </div>
          </div>

          {/* Screen Time Goals */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">יעדי זמן מסך</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מגבלה יומית (שעות)</label>
              <input
                type="number"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">יעד שבועי (שעות)</label>
              <input
                type="number"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                placeholder="14"
              />
            </div>
          </div>

          {/* Budget Setup */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">הגדרות תקציב</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">דמי כיס בסיסיים (₪ ליום)</label>
              <input
                type="number"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">בונוס לכל חצי שעה מתחת למגבלה (₪)</label>
              <input
                type="number"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                placeholder="1"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              יצירת פרופיל וקישור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



