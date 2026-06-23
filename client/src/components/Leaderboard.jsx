import React from 'react';
import useAllUsers from '../hooks/useAllUsers';
import number1SVG from '../assets/svg/number_1.svg';

export default function Leaderboard() {
  const { users, loading, error } = useAllUsers();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Exclude admins and sort by score descending
  const leaderboard = users
    .filter(user => !user.admin)
    .sort((a, b) => b.score - a.score);

  // Helper to check if this is the current user
  const isCurrentUser = (user) => {
    if (!currentUser) return false;
    return (
      user.username?.toLowerCase().trim() === currentUser.username?.toLowerCase().trim()
    );
  };

  return (
    <div className="bg-[#23263a] rounded-2xl max-w-[500px] mx-auto p-8 shadow-[0_4px_32px_0_rgba(0,0,0,0.18)]">
      <h2 className="text-[#ffaf1b] font-bold text-2xl mb-6 text-center">Leaderboard</h2>
      {loading && <div className="text-white text-center">Loading...</div>}
      {error && <div className="text-red-400 text-center">{error}</div>}
      {!loading && !error && (
        <div className="max-h-[420px] overflow-y-auto rounded-lg custom-scrollbar">
          <table className="w-full border-collapse text-white">
            <thead>
              <tr className="bg-[#ffaf1b]/[0.08]">
                <th className="text-[#ffaf1b] font-bold text-base py-2.5 px-4 text-center">Rank #</th>
                <th className="text-[#ffaf1b] font-bold text-base py-2.5 px-6 text-left">Full Name</th>
                <th className="text-[#ffaf1b] font-bold text-base py-2.5 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => {
                const highlight = isCurrentUser(user);
                return (
                  <tr
                    key={user.username}
                    className={
                      highlight
                        ? 'bg-[#ffaf1b]'
                        : `border-b border-[#31344b] ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#ffaf1b]/[0.03]'} `
                    }
                  >
                    <td className={
                      highlight
                        ? 'py-3.5 px-4 text-black font-bold text-center'
                        : 'py-3.5 px-4 text-[#ffaf1b] text-center font-bold'
                    }>
                      {idx+1}
                    </td>
                    <td className={
                      highlight
                        ? 'py-3.5 px-6 text-black font-bold'
                        : 'py-3.5 px-6 font-medium'
                    }>
                      {user.displayName}
                    </td>
                    <td className={
                      highlight
                        ? 'py-3.5 px-6 text-black font-bold text-right'
                        : 'py-3.5 px-6 text-right font-bold'
                    }>
                      {user.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
