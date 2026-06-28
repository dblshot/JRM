import React from 'react';
import useAllUsers from '../hooks/useAllUsers';
import useAllTests from '../hooks/useAllTests';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;
const GREEN = '#4caf50';
const RED = '#ff5252';

export default function TestStatus() {
  const { users, loading: usersLoading, error: usersError } = useAllUsers();
  const { tests, loading: testsLoading, error: testsError } = useAllTests();

  const loading = usersLoading || testsLoading;
  const error = usersError || testsError;

  const students = users.filter(u => !u.admin);

  // Build column labels (lesson titles), disambiguating duplicates
  const titleCounts = {};
  const columns = tests.map(test => {
    const base = test.lessonId?.title || 'Test';
    titleCounts[base] = (titleCounts[base] || 0) + 1;
    return { id: test._id, label: titleCounts[base] > 1 ? `${base} (${titleCounts[base]})` : base };
  });

  const completedMap = (student) => {
    const map = {};
    (student.completedTests || []).forEach(ct => {
      const tid = ct.testId?._id ? String(ct.testId._id) : String(ct.testId);
      map[tid] = ct;
    });
    return map;
  };

  const completedCountForTest = (testId) =>
    students.filter(s => (s.completedTests || []).some(ct => {
      const tid = ct.testId?._id ? String(ct.testId._id) : String(ct.testId);
      return tid === String(testId);
    })).length;

  const cellStyle = { padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #31344b' };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center' }}>Test Completion Status</h2>
      <p style={{ color: '#b0b3c6', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
        Green check = completed (score shown). Red cross = not taken yet.
      </p>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {!loading && !error && tests.length === 0 && (
        <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>No tests created yet.</div>
      )}
      {!loading && !error && tests.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
            <thead>
              <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 15, padding: '10px 14px', textAlign: 'left', position: 'sticky', left: 0, background: '#2a2d44' }}>Student</th>
                {columns.map(col => (
                  <th key={col.id} style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 14px', textAlign: 'center', minWidth: 110 }}>
                    {col.label}
                    <div style={{ color: '#b0b3c6', fontWeight: 500, fontSize: 12, marginTop: 4 }}>
                      {completedCountForTest(col.id)}/{students.length} done
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const map = completedMap(student);
                return (
                  <tr key={student.username} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, borderBottom: '1px solid #31344b', position: 'sticky', left: 0, background: idx % 2 === 0 ? CARD_BG : '#262a40' }}>
                      {student.displayName || student.username}
                    </td>
                    {columns.map(col => {
                      const ct = map[String(col.id)];
                      return (
                        <td key={col.id} style={cellStyle}>
                          {ct ? (
                            <span style={{ color: GREEN, fontWeight: 700 }}>✓ <span style={{ color: TEXT_COLOR, fontWeight: 500 }}>({ct.score})</span></span>
                          ) : (
                            <span style={{ color: RED, fontWeight: 700 }}>✗</span>
                          )}
                        </td>
                      );
                    })}
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
