import React from 'react';
import useAllUsers from '../hooks/useAllUsers';
import useAllAssignments from '../hooks/useAllAssignments';

const ORANGE = '#ffaf1b';
const CARD_BG = '#23263a';
const TEXT_COLOR = 'white';
const HEADER_COLOR = ORANGE;
const GREEN = '#4caf50';
const RED = '#ff5252';
const YELLOW = '#ffd54f';

export default function AssignmentStatus() {
  const { users, loading: usersLoading, error: usersError } = useAllUsers();
  const { assignments, loading: aLoading, error: aError } = useAllAssignments();

  const loading = usersLoading || aLoading;
  const error = usersError || aError;

  const students = users.filter(u => !u.admin);

  const columns = assignments.map(a => ({ id: a._id, label: a.title || 'Assignment' }));

  const submissionMap = (student) => {
    const map = {};
    (student.completedAssignments || []).forEach(ca => {
      const aid = ca.assignmentId?._id ? String(ca.assignmentId._id) : String(ca.assignmentId);
      map[aid] = ca;
    });
    return map;
  };

  const submittedCountFor = (assignmentId) =>
    students.filter(s => (s.completedAssignments || []).some(ca => {
      const aid = ca.assignmentId?._id ? String(ca.assignmentId._id) : String(ca.assignmentId);
      return aid === String(assignmentId);
    })).length;

  const cellStyle = { padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #31344b' };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
      <h2 style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 24, marginBottom: 8, textAlign: 'center' }}>Assignment Submission Status</h2>
      <p style={{ color: '#b0b3c6', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
        Green check = graded (grade shown). Yellow check = submitted, not graded. Red cross = not submitted.
      </p>
      {loading && <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {!loading && !error && assignments.length === 0 && (
        <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>No assignments created yet.</div>
      )}
      {!loading && !error && assignments.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: TEXT_COLOR }}>
            <thead>
              <tr style={{ background: 'rgba(255,175,27,0.08)' }}>
                <th style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 15, padding: '10px 14px', textAlign: 'left', position: 'sticky', left: 0, background: '#2a2d44' }}>Student</th>
                {columns.map(col => (
                  <th key={col.id} style={{ color: HEADER_COLOR, fontWeight: 700, fontSize: 14, padding: '10px 14px', textAlign: 'center', minWidth: 120 }}>
                    {col.label}
                    <div style={{ color: '#b0b3c6', fontWeight: 500, fontSize: 12, marginTop: 4 }}>
                      {submittedCountFor(col.id)}/{students.length} submitted
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const map = submissionMap(student);
                return (
                  <tr key={student.username} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,175,27,0.03)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, borderBottom: '1px solid #31344b', position: 'sticky', left: 0, background: idx % 2 === 0 ? CARD_BG : '#262a40' }}>
                      {student.displayName || student.username}
                    </td>
                    {columns.map(col => {
                      const ca = map[String(col.id)];
                      return (
                        <td key={col.id} style={cellStyle}>
                          {ca ? (
                            ca.graded ? (
                              <span style={{ color: GREEN, fontWeight: 700 }}>✓ <span style={{ color: TEXT_COLOR, fontWeight: 500 }}>({ca.grade})</span></span>
                            ) : (
                              <span style={{ color: YELLOW, fontWeight: 700 }}>✓ <span style={{ color: '#b0b3c6', fontWeight: 500, fontSize: 12 }}>(ungraded)</span></span>
                            )
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
